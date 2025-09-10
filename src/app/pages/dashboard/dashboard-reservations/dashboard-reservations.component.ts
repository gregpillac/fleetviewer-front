import {Component, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ReservationService } from '../../../services/reservation.service';
import { PersonService } from '../../../services/person/person.service';
import { VehicleService } from '../../../services/vehicle/vehicle.service';

import { Reservation } from '../../../models/reservation';
import { Person } from '../../../models/person.model';
import { Vehicle } from '../../../models/vehicle';
import {AuthService} from '../../../services/auth/auth.service';
import {Place} from '../../../models/place.model';

type Row = Reservation & {
    driver?: Person | null;
    vehicle?: Vehicle | null;
    driverLabel?: string;
    vehicleLabel?: string;
    statusLabel?: string;
};

@Component({
    selector: 'app-dashboard-reservations',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatTooltip
    ],
    templateUrl: './dashboard-reservations.component.html',
    styleUrl: './dashboard-reservations.component.scss',
    providers: [
        DatePipe,
        { provide: MatPaginatorIntl, useFactory: frenchMatPaginatorIntl },
        { provide: LOCALE_ID, useValue: 'fr-FR' }
    ]
})
export class DashboardReservationsComponent implements OnInit {
    private _paginator!: MatPaginator;
    @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) {
        if (p) {
            this._paginator = p;
            this.dataSource.paginator = p;
        }
    }

    // caches
    private personCache = new Map<number, Person>();
    private vehicleCache = new Map<number, Vehicle>();

    // pagination
    pageSize = 25;
    pageSizeOptions = [10, 25, 50, 100];

    // table
    displayedColumns = ['vehicle', 'driver', 'period', 'status', 'actions'];
    dataSource = new MatTableDataSource<Row>([]);
    loading = true;

    constructor(
        private reservationService: ReservationService,
        private personService: PersonService,
        private vehicleService: VehicleService,
        private authService: AuthService,
        private router: Router,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        this.dataSource.filterPredicate = (row, filter) => {
            const t = (v: any) => (v ?? '').toString().toLowerCase();
            const haystack = [
                row.vehicleLabel, row.driverLabel, row.statusLabel
            ].map(t).join(' ');
            return haystack.includes(t(filter));
        };

        this.fetchRows();
    }

    // --------- Data ---------
    private fetchRows(): void {
        this.loading = true;

        this.reservationService.getAllReservations().subscribe({
            next: (reservations) => {
                const rs = reservations ?? [];

                // 1) Collecte des IDs (cast -> number)
                const driverIds = Array.from(new Set(
                    rs.map(r => Number((r as any).driverId ?? (r as any).driver_id))
                        .filter(n => Number.isFinite(n))
                ));
                const vehicleIds = Array.from(new Set(
                    rs.map(r => Number((r as any).vehicleId ?? (r as any).vehicle_id))
                        .filter(n => Number.isFinite(n))
                ));

                const driverIdsToFetch  = driverIds.filter(id => !this.personCache.has(id));
                const vehicleIdsToFetch = vehicleIds.filter(id => !this.vehicleCache.has(id));

                // 2) On rend forkJoin "infaillible" (renvoie des maps vides au pire)
                const safePersons$  = this.fetchPersonsByIds(driverIdsToFetch).pipe(catchError(() => of(new Map<number, Person>())));
                const safeVehicles$ = this.fetchVehiclesByIds(vehicleIdsToFetch).pipe(catchError(() => of(new Map<number, Vehicle>())));

                forkJoin({
                    personsMap:  safePersons$,
                    vehiclesMap: safeVehicles$
                }).subscribe({
                    next: ({ personsMap, vehiclesMap }) => {
                        personsMap.forEach((p, id) => this.personCache.set(id, p));
                        vehiclesMap.forEach((v, id) => this.vehicleCache.set(id, v));

                        // 3) Filtrage par site si manager
                        const userPlaceId = this.currentUserPlace?.id; // peut être null
                        const filtered = (this.isAdmin || userPlaceId == null)
                            ? rs
                            : rs.filter(r => {
                                const vid = Number((r as any).vehicleId ?? (r as any).vehicle_id);
                                if (!Number.isFinite(vid)) return false;
                                const v = this.vehicleCache.get(vid);
                                return !!v && Number(v.placeId) === Number(userPlaceId);
                            });

                        // 4) Construction des rows
                        const rows: Row[] = filtered.map((r) => {
                            const driverId  = Number((r as any).driverId  ?? (r as any).driver_id);
                            const vehicleId = Number((r as any).vehicleId ?? (r as any).vehicle_id);

                            const driver  = Number.isFinite(driverId)  ? (this.personCache.get(driverId)  ?? null) : null;
                            const vehicle = Number.isFinite(vehicleId) ? (this.vehicleCache.get(vehicleId) ?? null) : null;
                            const period  = this.buildPeriodView(r);

                            const rawStatus = (r as any).reservationStatus
                                ?? (r as any).reservation_status
                                ?? (r as any).status;
                            const status = (rawStatus ?? '').toString().trim();

                            return {
                                ...r,
                                ...period,
                                driver,
                                vehicle,
                                driverLabel: this.personLabel(driver) || (Number.isFinite(driverId) ? `#${driverId}` : '—'),
                                vehicleLabel: this.vehicleLabel(vehicle) || (Number.isFinite(vehicleId) ? `#${vehicleId}` : '—'),
                                statusLabel: this.statusLabel(status)
                            };
                        });

                        rows.sort(this.compareRows);
                        this.dataSource.data = rows;
                        this.loading = false;
                    },

                    // 5) Fallback : pas de caches → impossible de déduire le placeId sans vehicle
                    //    => soit on affiche tout (plus simple), soit on masque et on affiche un message.
                    error: () => {
                        // Afficher tout avec labels fallback
                        const rows: Row[] = (reservations ?? []).map((r) => {
                            const driverId  = Number((r as any).driverId  ?? (r as any).driver_id);
                            const vehicleId = Number((r as any).vehicleId ?? (r as any).vehicle_id);

                            const rawStatus = (r as any).reservationStatus
                                ?? (r as any).reservation_status
                                ?? (r as any).status;
                            const status = (rawStatus ?? '').toString().trim();

                            return {
                                ...r,
                                driver: null,
                                vehicle: null,
                                driverLabel: Number.isFinite(driverId)  ? `#${driverId}` : '—',
                                vehicleLabel: Number.isFinite(vehicleId) ? `#${vehicleId}` : '—',
                                statusLabel: this.statusLabel(status)
                            };
                        });

                        rows.sort(this.compareRows);
                        this.dataSource.data = rows;
                        this.loading = false;
                    }
                });
            },

            error: () => {
                this.dataSource.data = [];
                this.loading = false;
            }
        });
    }

    private fetchPersonsByIds(ids: number[]) {
        if (ids.length === 0) return of(new Map<number, Person>());
        const obs = ids.map(id =>
            this.personService.getPersonById(id).pipe(
                catchError(() => of(null as unknown as Person)),
                map(p => [id, p] as const)
            )
        );
        return forkJoin(obs).pipe(
            map(entries => {
                const m = new Map<number, Person>();
                entries.forEach(([id, p]) => { if (p) m.set(id, p); });
                return m;
            })
        );
    }

    private fetchVehiclesByIds(ids: number[]) {
        if (ids.length === 0) return of(new Map<number, Vehicle>());
        const obs = ids.map(id =>
            this.vehicleService.getVehicleById(id).pipe(
                catchError(() => of(null as unknown as Vehicle)),
                map(v => [id, v] as const)
            )
        );
        return forkJoin(obs).pipe(
            map(entries => {
                const m = new Map<number, Vehicle>();
                entries.forEach(([id, v]) => { if (v) m.set(id, v); });
                return m;
            })
        );
    }

    applyFilter(value: string) {
        this.dataSource.filter = (value || '').trim().toLowerCase();
        if (this._paginator) this._paginator.firstPage();
    }

    // --------- Actions ---------
    goToCreateReservation() {
        this.router.navigate(['dashboard/reservations', 'add']);
    }

    editReservation(row: Row) {
        this.router.navigate(['dashboard/reservations', row.id]);
    }

    deleteReservation(row: Row) {
        if (!confirm(`Supprimer définitivement la réservation #${row.id} ?`)) return;
        this.reservationService.deleteReservation(row.id!).subscribe({
            next: () => {
                this.dataSource.data = this.dataSource.data.filter(r => r.id !== row.id);
            },
            error: () => alert('Échec de la suppression de la réservation.'),
        });
    }

    // --------- Tri ---------
    private compareRows = (a: Row, b: Row) => {
        const ad = new Date((a as any).startDate ?? (a as any).start_date).getTime();
        const bd = new Date((b as any).startDate ?? (b as any).start_date).getTime();
        if (ad !== bd) return bd - ad;

        const va = (a.vehicleLabel ?? '').toLowerCase();
        const vb = (b.vehicleLabel ?? '').toLowerCase();
        if (va !== vb) return va.localeCompare(vb, 'fr');

        const da = (a.driverLabel ?? '').toLowerCase();
        const db = (b.driverLabel ?? '').toLowerCase();
        return da.localeCompare(db, 'fr');
    };

    // --------- Helpers ---------
    private personLabel(p?: Person | null): string {
        if (!p) return '—';
        const fn = (p as any).firstName ?? '';
        const ln = (p as any).lastName ?? '';
        const email = (p as any).email ?? '';
        const name = `${fn} ${ln}`.trim();
        return name || email || '—';
    }

    private vehicleLabel(v?: Vehicle | null): string {
        if (!v) return '—';
        const plate = (v as any).plateNumber ?? (v as any).plate ?? '';
        const brand = (v as any).brand ?? '';
        const model = (v as any).model ?? '';
        const parts = [plate, [brand, model].filter(Boolean).join(' ')].filter(Boolean);
        return parts.join(' · ') || '—';
    }

    private buildPeriodView(r: any) {
        const start = new Date(r.startDate ?? r.start_date);
        const end   = new Date(r.endDate   ?? r.end_date);

        // FR format court: "15/09/2025"
        const fmtDateLong = (d: Date) =>
            this.datePipe.transform(d, 'dd/MM/yyyy', 'fr-FR') ?? '';

        // Heures: "08:30"
        const fmtTime = (d: Date) =>
            this.datePipe.transform(d, 'HH:mm') ?? '';

        const durationMs = Math.max(0, end.getTime() - start.getTime());
        const h = Math.floor(durationMs / 3_600_000);
        const m = Math.floor((durationMs % 3_600_000) / 60_000);
        const pad = (n: number) => n.toString().padStart(2, '0');

        let durationLabel: string;

        if (h % 24 === 0 && m === 0) {
            // Durée exacte en jours
            const days = h / 24;
            durationLabel = `${days} j`;
        } else if (h >= 24) {
            // Plus d'un jour mais pas "pile" -> on affiche +N j
            const days = Math.floor(h / 24);
            durationLabel = `+ ${days} j`;
        } else {
            // Moins de 24h → format heures et minutes
            durationLabel = `${h} h ${pad(m)}`;
        }

        return {
            periodStartDateLong: fmtDateLong(start),
            periodEndDateLong:   fmtDateLong(end),
            periodStartTime:     fmtTime(start),
            periodEndTime:       fmtTime(end),
            periodDurationLabel: durationLabel
        };
    }

    statusLabel(status?: string): string {
        switch ((status ?? '').toUpperCase()) {
            case 'PENDING':     return 'En attente de validation';
            case 'CONFIRMED':    return 'Confirmée';
            case 'REJECTED':    return 'Refusée';
            case 'CANCELLED':   return 'Annulée';
            case 'UNAVAILABLE': return 'Indisponible';
            default:            return '—';
        }
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    get isManager(): boolean {
        return this.authService.isManager();
    }

    get currentUserPlace(): Place | null {
        return this.authService.getCurrentUser()?.person?.place ?? null;
    }
}

// Labels FR pour le paginator
export function frenchMatPaginatorIntl(): MatPaginatorIntl {
    const intl = new MatPaginatorIntl();
    intl.itemsPerPageLabel = 'Éléments par page';
    intl.nextPageLabel = 'Page suivante';
    intl.previousPageLabel = 'Page précédente';
    intl.firstPageLabel = 'Première page';
    intl.lastPageLabel = 'Dernière page';
    intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) return `0 sur ${length}`;
        const start = page * pageSize;
        const end = Math.min(start + pageSize, length);
        return `${start + 1} – ${end} sur ${length}`;
    };
    return intl;
}

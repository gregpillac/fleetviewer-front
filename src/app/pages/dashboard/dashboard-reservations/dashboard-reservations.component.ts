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

type Row = Reservation & {
    driver?: Person | null;
    vehicle?: Vehicle | null;
    driverLabel?: string;
    vehicleLabel?: string;
    statusLabel?: string;
    periodLabel?: string;
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
        private router: Router,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        this.dataSource.filterPredicate = (row, filter) => {
            const t = (v: any) => (v ?? '').toString().toLowerCase();
            const haystack = [
                row.vehicleLabel, row.driverLabel, row.statusLabel, row.periodLabel
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

                // IDs uniques
                const driverIds = Array.from(new Set(
                    rs.map(r => (r as any).driverId ?? (r as any).driver_id)
                        .filter((x: any): x is number => Number.isFinite(x))
                ));
                const vehicleIds = Array.from(new Set(
                    rs.map(r => (r as any).vehicleId ?? (r as any).vehicle_id)
                        .filter((x: any): x is number => Number.isFinite(x))
                ));

                const driverIdsToFetch  = driverIds.filter(id => !this.personCache.has(id));
                const vehicleIdsToFetch = vehicleIds.filter(id => !this.vehicleCache.has(id));

                forkJoin({
                    personsMap:  this.fetchPersonsByIds(driverIdsToFetch),
                    vehiclesMap: this.fetchVehiclesByIds(vehicleIdsToFetch),
                }).subscribe({
                    next: ({ personsMap, vehiclesMap }) => {
                        personsMap.forEach((p, id) => this.personCache.set(id, p));
                        vehiclesMap.forEach((v, id) => this.vehicleCache.set(id, v));

                        const rows: Row[] = rs.map((r) => {
                            const driverId  = (r as any).driverId  ?? (r as any).driver_id;
                            const vehicleId = (r as any).vehicleId ?? (r as any).vehicle_id;

                            const driver  = this.personCache.get(driverId)  ?? null;
                            const vehicle = this.vehicleCache.get(vehicleId) ?? null;
                            const period = this.buildPeriodView(r);

                            return {
                                ...r,
                                ...period,
                                driver,
                                vehicle,
                                driverLabel: this.personLabel(driver) || (driverId ? `#${driverId}` : '—'),
                                vehicleLabel: this.vehicleLabel(vehicle) || (vehicleId ? `#${vehicleId}` : '—'),
                                statusLabel: this.statusLabel((r as any).reservationStatus ?? (r as any).reservation_status)
                            };
                        });

                        rows.sort(this.compareRows);
                        this.dataSource.data = rows;
                        this.loading = false;
                    },
                    error: () => {
                        const rows: Row[] = rs.map((r) => {
                            const driverId  = (r as any).driverId  ?? (r as any).driver_id;
                            const vehicleId = (r as any).vehicleId ?? (r as any).vehicle_id;
                            return {
                                ...r,
                                driver: null,
                                vehicle: null,
                                driverLabel: driverId ? `#${driverId}` : '—',
                                vehicleLabel: vehicleId ? `#${vehicleId}` : '—',
                                statusLabel: this.statusLabel((r as any).reservationStatus ?? (r as any).reservation_status),
                                periodLabel: this.periodLabel(r),
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

    private periodLabel(r: any): string {
        const start = new Date(r.startDate ?? r.start_date);
        const end   = new Date(r.endDate   ?? r.end_date);

        const sameDay = start.toDateString() === end.toDateString();

        const fmtDateLong = (d: Date) =>
            this.datePipe.transform(d, 'd MMMM y', 'fr-FR') ?? '';

        const fmtTime = (d: Date) =>
            this.datePipe.transform(d, 'HH:mm') ?? '';

        if (sameDay) {
            return `${fmtDateLong(start)} · ${fmtTime(start)} – ${fmtTime(end)}`;
        }
        return `${fmtDateLong(start)} ${fmtTime(start)} – ${fmtDateLong(end)} ${fmtTime(end)}`;
    }

    private buildPeriodView(r: any) {
        const start = new Date(r.startDate ?? r.start_date);
        const end   = new Date(r.endDate   ?? r.end_date);

        // FR longue: "lundi 15 septembre 2025"
        const fmtDateLong = (d: Date) =>
            this.datePipe.transform(d, 'EEEE d MMMM y', 'fr-FR') ?? '';

        // Heures: "08:30"
        const fmtTime = (d: Date) =>
            this.datePipe.transform(d, 'HH:mm') ?? '';

        const durationMs = Math.max(0, end.getTime() - start.getTime());
        const h = Math.floor(durationMs / 3_600_000);
        const m = Math.floor((durationMs % 3_600_000) / 60_000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const durationLabel = `${h} h ${pad(m)}`;

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
            case 'PENDING':     return 'En attente';
            case 'APPROVED':    return 'Validée';
            case 'REJECTED':    return 'Refusée';
            case 'CANCELLED':   return 'Annulée';
            case 'UNAVAILABLE': return 'Indisponibilité';
            default:            return '—';
        }
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Reservation } from '../../../../models/reservation';
import { Vehicle } from '../../../../models/vehicle';
import { Person } from '../../../../models/person.model';

import { ReservationService } from '../../../../services/reservation.service';
import { PersonService } from '../../../../services/person/person.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Status } from '../../../../enums/Status';

import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { PlaceService } from '../../../../services/place/place.service';

type Row = Reservation & {
    driver?: Person | null;
};

type Place = { id: number; label?: string; name?: string };

@Component({
    selector: 'app-pending-reservations',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatProgressBarModule,
        MatTooltipModule
    ],
    templateUrl: './pending-reservations.component.html',
    styleUrls: ['./pending-reservations.component.scss']
})
export class PendingReservationsComponent implements OnInit {

    loading = true;
    rows: Row[] = [];

    expandedId: number | null = null;
    vehicleOptionsByRes = new Map<number, Vehicle[]>(); // reservationId -> vehicles[]
    selectionByRes = new Map<number, number>();         // reservationId -> vehicleId
    processing = new Set<number>();

    private placeCache = new Map<number, Observable<string>>();

    constructor(
        private reservationsService: ReservationService,
        private personService: PersonService,
        private authService: AuthService,
        private placeService: PlaceService
    ) {}

    get isAdmin()   { return this.authService.isAdmin(); }
    get isManager() { return this.authService.isManager(); }
    get currentPlaceId(): number | null {
        const id = this.authService.getCurrentUser()?.person?.place?.id;
        return Number.isFinite(id as any) ? Number(id) : null;
    }

    ngOnInit(): void {
        const placeId = this.isAdmin ? undefined : this.currentPlaceId ?? undefined;

        this.reservationsService.getReservationsByStatus(Status.PENDING, placeId).subscribe({
            next: (reservations) => {
                const list = reservations ?? [];

                // IDs conducteurs uniques
                const driverIds = Array.from(
                    new Set(
                        list
                            .map(r => (r as any)['driverId'] ?? (r as any)['driver_id'])
                            .filter((x: any): x is number => Number.isFinite(Number(x)))
                            .map(Number)
                    )
                );

                if (driverIds.length === 0) {
                    this.rows = list as Row[];
                    this.loading = false;
                    return;
                }

                // Charger toutes les Person en parallèle
                forkJoin(
                    driverIds.map(id =>
                        this.personService.getPersonById(id).pipe(
                            catchError(() => of(null as unknown as Person))
                        )
                    )
                ).subscribe({
                    next: (persons) => {
                        const map = new Map<number, Person>();
                        persons.forEach(p => { if (p && p.id != null) map.set(Number(p.id), p); });

                        this.rows = (list as Row[]).map(r => {
                            const rawId = (r as any)['driverId'] ?? (r as any)['driver_id'];
                            const id = Number(rawId);
                            const driver = Number.isFinite(id) ? map.get(id) ?? null : null;
                            return { ...r, driver };
                        });

                        this.loading = false;
                    },
                    error: () => {
                        this.rows = list as Row[];
                        this.loading = false;
                    }
                });
            },
            error: () => { this.rows = []; this.loading = false; }
        });
    }

    // ISO local "YYYY-MM-DDTHH:mm:ss" attendu par le back (LocalDateTime)
    private toLocalIso(d: any): string {
        const date = new Date(d);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    toggleExpand(r: Row) {
        this.expandedId = (this.expandedId === r.id) ? null : (r.id ?? null);

        if (this.expandedId === r.id && !this.vehicleOptionsByRes.has(r.id!)) {
            const startIso = this.toLocalIso((r as any)['startDate'] ?? (r as any)['start_date']);
            const endIso   = this.toLocalIso((r as any)['endDate']   ?? (r as any)['end_date']);
            const placeId  = this.isAdmin ? undefined : this.currentPlaceId ?? undefined;

            this.reservationsService.getAvailableVehicles(startIso, endIso, placeId)
                .subscribe(vs => this.vehicleOptionsByRes.set(r.id!, vs ?? []));
        }
    }

    onSelectVehicle(resId: number, vehicleId: number) {
        this.selectionByRes.set(resId, vehicleId);
    }

    accept(r: Row) {
        const resId = r.id!;
        const vehicleId = this.selectionByRes.get(resId);
        if (!vehicleId) return;

        this.processing.add(resId);
        this.reservationsService.updateStatus(resId, Status.CONFIRMED, vehicleId).subscribe({
            next: () => {
                this.rows = this.rows.filter(x => x.id !== resId);
                this.processing.delete(resId);
                this.vehicleOptionsByRes.delete(resId);
                this.selectionByRes.delete(resId);
            },
            error: () => this.processing.delete(resId)
        });
    }

    reject(r: Row) {
        const resId = r.id!;
        if (!confirm(`Refuser la réservation #${resId} ?`)) return;

        this.processing.add(resId);
        this.reservationsService.updateStatus(resId, Status.REJECTED).subscribe({
            next: () => {
                this.rows = this.rows.filter(x => x.id !== resId);
                this.processing.delete(resId);
                this.vehicleOptionsByRes.delete(resId);
                this.selectionByRes.delete(resId);
            },
            error: () => this.processing.delete(resId)
        });
    }

    /* ===========================
     *  Helpers affichage
     * =========================== */

    // Résout un nom de lieu à partir de l'id, avec cache et async pipe
    placeName$(id?: number | null): Observable<string> {
        if (id == null) return of('—');
        const key = Number(id);
        if (!Number.isFinite(key)) return of('—');

        const cached = this.placeCache.get(key);
        if (cached) return cached;

        const obs = this.placeService.getPlaceById(key).pipe(
            map((p: Place | null | undefined) => p?.label || p?.name || `Lieu #${key}`),
            catchError(() => of(`Lieu #${key}`)),
            shareReplay(1)
        );
        this.placeCache.set(key, obs);
        return obs;
    }

    // Durée lisible HH h MM (ou X j Y h si > 24h)
    durationLabel(r: Row): string {
        const start = new Date((r as any)['startDate'] ?? (r as any)['start_date']).getTime();
        const end   = new Date((r as any)['endDate']   ?? (r as any)['end_date']).getTime();
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return '—';

        const totalMin = Math.floor((end - start) / 60000);
        const days  = Math.floor(totalMin / (60 * 24));
        const hours = Math.floor((totalMin % (60 * 24)) / 60);
        const mins  = totalMin % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');

        if (days > 0) return `${days} j ${hours} h ${pad(mins)}`;
        return `${hours} h ${pad(mins)}`;
    }
}

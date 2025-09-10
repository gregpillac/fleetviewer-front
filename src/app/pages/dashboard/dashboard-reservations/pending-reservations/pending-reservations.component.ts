import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

import { Reservation } from '../../../../models/reservation';
import { Vehicle } from '../../../../models/vehicle';
import { Person } from '../../../../models/person.model';

import { ReservationService } from '../../../../services/reservation.service';
import { PersonService } from '../../../../services/person/person.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Status } from '../../../../enums/Status';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Row = Reservation & {
    driver?: Person | null;
};

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
        MatProgressBarModule
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

    constructor(
        private reservationsService: ReservationService,
        private personService: PersonService,
        private authService: AuthService
    ) {}

    get isAdmin() { return this.authService.isAdmin(); }
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
}

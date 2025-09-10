import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { Reservation } from '../../models/reservation';
import { Status } from '../../enums/Status';
import { Place } from '../../models/place.model';
import { Vehicle } from '../../models/vehicle'; // ajuste si nécessaire

import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth/auth.service';
import { PlaceService } from '../../services/place/place.service';
import { VehicleService } from '../../services/vehicle/vehicle.service'; // ajuste le chemin si besoin

@Component({
    selector: 'app-reservations',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatProgressBarModule,
        MatTooltipModule
    ],
    templateUrl: './reservations.component.html',
    styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {

    Status = Status; // pour le template

    loading = true;
    rows: Reservation[] = [];
    expandedId: number | null = null;

    private placeCache = new Map<number, Observable<string>>();
    private vehicleCache = new Map<number, Observable<Vehicle | null>>();

    constructor(
        private reservationsService: ReservationService,
        private authService: AuthService,
        private placeService: PlaceService,
        private vehicleService: VehicleService
    ) {}

    ngOnInit(): void {
        const driverId = this.authService.getCurrentUser()?.person?.id;
        const id = Number(driverId);

        if (!Number.isFinite(id)) {
            this.rows = [];
            this.loading = false;
            return;
        }

        this.reservationsService.getReservationsByDriverId(id).subscribe({
            next: (reservations) => {
                this.rows = (reservations ?? []) as Reservation[];
                this.loading = false;
            },
            error: () => {
                this.rows = [];
                this.loading = false;
            }
        });
    }

    toggleExpand(r: Reservation) {
        this.expandedId = (this.expandedId === r.id) ? null : (r.id ?? null);
    }

    /* ===== Helpers d’affichage ===== */

    // Noms de lieux (cache + async)
    placeName$(placeId?: number | null): Observable<string> {
        if (placeId == null) return of('—');
        const key = Number(placeId);
        if (!Number.isFinite(key)) return of('—');

        const cached = this.placeCache.get(key);
        if (cached) return cached;

        const obs = this.placeService.getPlaceById(key).pipe(
            map((p: Place | null | undefined) => p?.name || `Lieu #${key}`),
            catchError(() => of(`Lieu #${key}`)),
            shareReplay(1)
        );
        this.placeCache.set(key, obs);
        return obs;
    }

    // Récupère vehicleId depuis la réservation (camel/snake)
    vehicleId(r: Reservation): number | null {
        const raw = (r as any)['vehicleId'] ?? (r as any)['vehicle_id'];
        const id = Number(raw);
        return Number.isFinite(id) ? id : null;
    }

    // Observable Vehicle mémoïsé
    private vehicle$(id: number): Observable<Vehicle | null> {
        const cached = this.vehicleCache.get(id);
        if (cached) return cached;

        const obs = this.vehicleService.getVehicleById(id).pipe(
            catchError(() => of(null)),
            shareReplay(1)
        );
        this.vehicleCache.set(id, obs);
        return obs;
    }

    // Libellé véhicule à afficher (plaque — marque modèle) ou fallback "Véhicule #id"
    vehicleLabel$(id: number): Observable<string> {
        return this.vehicle$(id).pipe(
            map((v: Vehicle | null) => {
                if (!v) return `Véhicule #${id}`;
                const plate = (v as any).licensePlate ?? (v as any).license_plate ?? '—';
                const brand = (v as any).brand ?? (v as any).marque ?? '';
                const model = (v as any).model ?? (v as any).modele ?? '';
                const bm = [brand, model].filter(Boolean).join(' ');
                return bm ? `${plate} — ${bm}` : `${plate}`;
            }),
            catchError(() => of(`Véhicule #${id}`))
        );
    }

    // Libellé statut (FR)
    statusLabel(s: Status | string | undefined): string {
        switch (s) {
            case Status.PENDING:   return 'En attente';
            case Status.CONFIRMED: return 'Confirmée';
            case Status.REJECTED:  return 'Refusée';
            case Status.CANCELLED: return 'Annulée';
            default: return '—';
        }
    }

    // Classe CSS pour badge
    statusClass(s: Status | string | undefined): string {
        switch (s) {
            case Status.PENDING:   return 'is-pending';
            case Status.CONFIRMED: return 'is-confirmed';
            case Status.REJECTED:  return 'is-rejected';
            case Status.CANCELLED: return 'is-cancelled';
            default: return '';
        }
    }

    // Durée lisible (FR-like)
    durationLabel(r: Reservation): string {
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

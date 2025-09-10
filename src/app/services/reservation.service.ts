import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Reservation} from '../models/reservation';
import {Observable} from 'rxjs';
import {Status} from '../enums/Status';
import {Vehicle} from '../models/vehicle';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

    private apiUrl = environment.apiBaseUrl + '/api/reservations';

    constructor(private http: HttpClient) { }

    /** Récupère toutes les réservations (sans points d’itinéraire, pour perf) */
    getAllReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(this.apiUrl);
    }

    /** Récupère une réservation par son id (avec points d’itinéraire côté backend) */
    getReservationById(id: number): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
    }

    /** Récupère les réservations d’un conducteur par son id (liste sans points d’itinéraire) */
    getReservationsByDriverId(driverId: number): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/driver/${driverId}`);
    }

    getReservationsByStatus(status: Status, placeId?: number) {
        let params = new HttpParams().set('status', status);
        if (placeId != null) params = params.set('placeId', String(placeId));
        return this.http.get<Reservation[]>(`${this.apiUrl}/by-status`, { params });
    }

    /** Véhicules dispo sur période (start/end au format ISO local: 'YYYY-MM-DDTHH:mm:ss') */
    getAvailableVehicles(start: string, end: string, placeId?: number) {
        let params = new HttpParams().set('start', start).set('end', end);
        if (placeId != null) params = params.set('placeId', String(placeId));
        return this.http.get<Vehicle[]>(`${this.apiUrl}/available-vehicles`, { params });
    }

    /** Crée une réservation */
    createReservation(reservation: Reservation): Observable<Reservation> {
        return this.http.post<Reservation>(this.apiUrl, reservation);
    }

    /** Met à jour une réservation (status/driver) */
    updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
    }

    updateStatus(reservationId: number, status: Status, vehicleId?: number) {
        let params = new HttpParams().set('status', status);
        if (vehicleId != null) params = params.set('vehicleId', String(vehicleId));
        return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}/status`, null, { params });
    }

    /** Supprime une réservation */
    deleteReservation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getCompatibleReservations(reservation: Reservation):Observable<Reservation[]> {
        return this.http.post<Reservation[]>(`${this.apiUrl}/compatibles`, reservation);
    }
}

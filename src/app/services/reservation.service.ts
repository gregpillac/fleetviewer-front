import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Reservation} from '../models/reservation';
import {Observable} from 'rxjs';

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

    /** Crée une réservation */
    createReservation(reservation: Reservation): Observable<Reservation> {
        return this.http.post<Reservation>(this.apiUrl, reservation);
    }

    /** Met à jour une réservation (status/driver) */
    updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
    }

    /** Supprime une réservation */
    deleteReservation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {CreateVehicleKey, VehicleKey} from '../../models/vehicle-key';

@Injectable({
    providedIn: 'root'
})
export class VehicleKeyService {
    private apiUrl = environment.apiBaseUrl + '/api/vehicle-keys';

    constructor(private http: HttpClient) {}

    getKeys(): Observable<VehicleKey[]> {
        return this.http.get<VehicleKey[]>(this.apiUrl);
    }

    getKeyById(id: number): Observable<VehicleKey> {
        return this.http.get<VehicleKey>(`${this.apiUrl}/${id}`);
    }

    create(key: CreateVehicleKey ): Observable<VehicleKey> {
        return this.http.post<VehicleKey>(this.apiUrl, key);
    }

    update(key: VehicleKey): Observable<VehicleKey> {
        return this.http.put<VehicleKey>(`${this.apiUrl}/${key.id}`, key);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getKeyByVehicle(vehicleId: number): Observable<VehicleKey[]> {
        return this.http.get<VehicleKey[]>(`${this.apiUrl}/by-vehicle/${vehicleId}`);
    }
    getKeyByPlace(placeId: number): Observable<VehicleKey[]> {
        return this.http.get<VehicleKey[]>(`${this.apiUrl}/by-place/${placeId}`);
    }
}

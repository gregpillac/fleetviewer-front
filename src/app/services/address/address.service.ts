import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Address, CreateAddress} from '../../models/address.model';

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private apiUrl = environment.apiBaseUrl + '/api/addresses';

    constructor(private http: HttpClient) {}

    getAddresses(): Observable<Address[]> {
        return this.http.get<Address[]>(this.apiUrl);
    }

    getAddressById(id: number): Observable<Address> {
        return this.http.get<Address>(`${this.apiUrl}/${id}`);
    }

    create(address: CreateAddress ): Observable<Address> {
        return this.http.post<Address>(this.apiUrl, address);
    }

    update(address: Address): Observable<Address> {
        return this.http.put<Address>(`${this.apiUrl}/${address.id}`, address);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

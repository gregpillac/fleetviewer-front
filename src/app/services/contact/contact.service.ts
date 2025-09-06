import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Address, CreateAddress} from '../../models/address.model';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private apiUrl = environment.apiBaseUrl + '/api/contact';

    constructor(private http: HttpClient) {}

    sendMessage(contactData: any): Observable<any> {
        return this.http.post(this.apiUrl, contactData);
    }
}

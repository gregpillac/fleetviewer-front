import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Address, CreateAddress} from '../../models/address.model';
import {Role} from '../../models/role.model';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private apiUrl = environment.apiBaseUrl + '/api/roles';

    constructor(private http: HttpClient) {}

    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl);
    }
}

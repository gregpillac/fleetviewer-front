import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {CreateUser, User} from '../../models/user.model';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = environment.apiBaseUrl + '/api/users';

    constructor(private http: HttpClient) {}

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}`);
    }

    getUserByUsername(username: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${username}`);
    }

    getUserByPersonId(personId: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/by-person/${personId}`);
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`);
    }

    updateCurrentUser(user: User): Observable<any> {
        return this.http.put<User>(`${this.apiUrl}/me`, user);
    }

    changeCurrentUserPassword(currentPassword: string, newPassword: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/me/password`, {currentPassword, newPassword});
    }

    create(user: CreateUser): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}`, user);
    }

    update(user: User): Observable<any> {
        return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
    }

    updateStatus(id: number, enabled: boolean): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/status/${id}?enabled=${enabled}`, {});
    }

    generateUsername(firstName: string, lastName: string): Observable<string> {
        const params = new HttpParams()
            .set('firstName', firstName)
            .set('lastName', lastName);

        return this.http.get(`${this.apiUrl}/generate-username`, { params, responseType: 'text' });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

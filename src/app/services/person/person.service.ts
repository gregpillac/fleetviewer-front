import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {CreatePerson, Person} from '../../models/person.model';

@Injectable({
    providedIn: 'root'
})
export class PersonService {
    private apiUrl = environment.apiBaseUrl + '/api/persons';

    constructor(private http: HttpClient) {}

    getPersons(): Observable<Person[]> {
        return this.http.get<Person[]>(this.apiUrl);
    }

    getPersonsByPlace(placeName: string): Observable<Person[]> {
        return this.http.get<Person[]>(`${this.apiUrl}/place/${encodeURIComponent(placeName)}`);
    }

    getPersonById(id: number): Observable<Person> {
        return this.http.get<Person>(`${this.apiUrl}/${id}`);
    }

    create(person: CreatePerson ): Observable<Person> {
        return this.http.post<Person>(this.apiUrl, person);
    }

    update(person: Person): Observable<Person> {
        return this.http.put<Person>(`${this.apiUrl}/${person.id}`, person);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

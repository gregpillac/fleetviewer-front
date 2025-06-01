import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, tap} from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://localhost:8080/api/auth/login';


  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials).pipe(
      tap((res) => {
        sessionStorage.setItem('token', res.token);
      }),
      map(() => {})
    );
  }

  logout() {
    sessionStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, map, Observable, switchMap, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {User} from '../../models/user.model';
import {UserService} from '../user/user.service';

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
  private loginUrl = environment.apiBaseUrl + '/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private userService: UserService) {}

  setUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isUser(): boolean {
    return this.getCurrentUser()?.role === 'ROLE_USER';
  }

  isManager(): boolean {
    return this.getCurrentUser()?.role === 'ROLE_MANAGER';
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ROLE_ADMIN';
  }

  login(credentials: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(`${this.loginUrl}/login`, credentials).pipe(
      switchMap(res => {
        sessionStorage.setItem('token', res.token);
        // Charger l'utilisateur et le stocker
        return this.userService.getCurrentUser().pipe(
          tap(user => this.setUser(user))
        );
      }),
      map(() => {})
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.setUser(null); // Réinitialise le currentUser
  }


  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }
}

import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationEnd, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';

// --- Stubs ultra-minimaux ---
class RouterStub {
    events = new Subject<any>();
    navigateByUrl(_: string) {}
}
class AuthServiceStub {
    currentUser$ = new BehaviorSubject<any>(null);
    setCurrentUser(_: any) {}
    isAdmin() { return false; }
    isManager() { return false; }
    isUser() { return false; }
    isLoggedIn() { return false; }
}
class UserServiceStub {
    getCurrentUser() { return of(null); }
}

describe('AppComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent, HttpClientTestingModule],
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: AuthService, useClass: AuthServiceStub },
                { provide: UserService, useClass: UserServiceStub },
            ],
        })
            .overrideComponent(AppComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should hide layout on /login (showLayout = false)', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const router = TestBed.inject(Router) as unknown as RouterStub;

        // Par défaut true
        expect(app.showLayout).toBeTrue();

        // Simule un NavigationEnd vers /login
        router.events.next(new NavigationEnd(1, '/login', '/login'));

        expect(app.showLayout).toBeFalse();
    });
});

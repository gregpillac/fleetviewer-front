import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

class AuthServiceStub {
    isLoggedIn() { return false; }
    login(_: any) { return of({}); }
    getCurrentUser() { return { role: { id: 'ROLE_USER' } }; }
}

class RouterStub {
    navigate(_: any[]) {}
}

describe('LoginComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                { provide: AuthService, useClass: AuthServiceStub },
                { provide: Router, useClass: RouterStub },
            ],
        })
            .overrideComponent(LoginComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(LoginComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

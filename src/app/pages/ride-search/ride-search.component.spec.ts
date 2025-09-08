import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RideSearchComponent } from './ride-search.component';
import { AuthService } from '../../services/auth/auth.service';

class AuthServiceStub {
    currentUser$ = new BehaviorSubject<any>(null);
    setCurrentUser(_: any) {}
    isAdmin() { return false; }
    isManager() { return false; }
    isUser() { return false; }
    isLoggedIn() { return false; }
    getCurrentUser() { return null; }
}

describe('RideSearchComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RideSearchComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: AuthService, useClass: AuthServiceStub }],
        })
            .overrideComponent(RideSearchComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const f = TestBed.createComponent(RideSearchComponent);
        expect(f.componentInstance).toBeTruthy();
    });
});

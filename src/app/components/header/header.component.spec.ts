import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth/auth.service'; // adapte le chemin

class AuthServiceStub {
    currentUser$ = new BehaviorSubject<any>(null);
    setCurrentUser(_: any) {}
    isAdmin() { return false; }
    isManager() { return false; }
    isUser() { return false; }
    isLoggedIn() { return false; }
}

describe('HeaderComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent, HttpClientTestingModule],
            providers: [{ provide: AuthService, useClass: AuthServiceStub }],
        })
            .overrideComponent(HeaderComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const f = TestBed.createComponent(HeaderComponent);
        expect(f.componentInstance).toBeTruthy();
    });
});

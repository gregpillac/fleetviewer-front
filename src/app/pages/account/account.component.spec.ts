import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { AccountComponent } from './account.component';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

class AuthServiceStub {
    currentUser$ = new BehaviorSubject<any>({ id: 1, username: 'john', person: {} });
    setCurrentUser() {}
    isAdmin() { return false; }
    isManager() { return false; }
    isUser() { return true; }
}

class UserServiceStub {
    getCurrentUser() { return of({ id: 1, username: 'john', person: {} }); }
    updateCurrentUser(_: any) { return of({ id: 1, username: 'john', person: {} }); }
    changeCurrentUserPassword(_: string, __: string) { return of(null); }
    generateUsername(_: string, __: string) { return of('john'); }
}

describe('AccountComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccountComponent],
            providers: [
                { provide: AuthService, useClass: AuthServiceStub },
                { provide: UserService, useClass: UserServiceStub },
            ],
        })
            .overrideComponent(AccountComponent, { set: { template: '' } }) // neutralise le HTML
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(AccountComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

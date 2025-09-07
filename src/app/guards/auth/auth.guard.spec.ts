import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, isObservable, firstValueFrom } from 'rxjs';

import { canActivateWithRole } from './auth.guard';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

describe('canActivateWithRole (functional guard)', () => {
    let auth: jasmine.SpyObj<AuthService>;
    let users: jasmine.SpyObj<UserService>;
    let router: Router;

    beforeEach(() => {
        auth = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'logout']);
        users = jasmine.createSpyObj<UserService>('UserService', ['getCurrentUser']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                { provide: AuthService, useValue: auth },
                { provide: UserService, useValue: users },
            ],
        });

        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    });

    // Toujours renvoyer un Observable<GuardResult> pour éviter TS2345
    function callGuard$(required?: string | string[]) {
        return TestBed.runInInjectionContext(() => {
            const res = canActivateWithRole(required)(
                {} as ActivatedRouteSnapshot,
                {} as RouterStateSnapshot
            );
            return isObservable(res) ? res : of(res);
        });
    }

    it('refuse + logout si non authentifié', async () => {
        auth.isLoggedIn.and.returnValue(false);

        const result = await firstValueFrom(callGuard$());
        expect(result).toBeFalse();
        expect(auth.logout).toHaveBeenCalled();
        expect(users.getCurrentUser).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('autorise sans rôle requis', async () => {
        auth.isLoggedIn.and.returnValue(true);
        users.getCurrentUser.and.returnValue(of({ role: { id: 'user' } } as any));

        const result = await firstValueFrom(callGuard$());
        expect(result).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('autorise si rôle requis présent; sinon redirige /not-found', async () => {
        auth.isLoggedIn.and.returnValue(true);

        users.getCurrentUser.and.returnValue(of({ role: { id: 'admin' } } as any));
        expect(await firstValueFrom(callGuard$('admin'))).toBeTrue();

        users.getCurrentUser.and.returnValue(of({ role: { id: 'user' } } as any));
        expect(await firstValueFrom(callGuard$('admin'))).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/not-found']);
    });

    it('autorise si un des rôles requis (array) correspond', async () => {
        auth.isLoggedIn.and.returnValue(true);
        users.getCurrentUser.and.returnValue(of({ role: { id: 'manager' } } as any));

        const result = await firstValueFrom(callGuard$( ['admin', 'manager'] ));
        expect(result).toBeTrue();
    });

    it('refuse + logout si getCurrentUser() jette', async () => {
        auth.isLoggedIn.and.returnValue(true);
        users.getCurrentUser.and.returnValue(throwError(() => new Error('boom')));

        const result = await firstValueFrom(callGuard$('admin'));
        expect(result).toBeFalse();
        expect(auth.logout).toHaveBeenCalled();
    });
});

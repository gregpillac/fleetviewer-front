import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export function canActivateWithRole(requiredRoles?: string | string[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const userService = inject(UserService);
        const router = inject(Router);

        if (!authService.isLoggedIn()) {
            authService.logout();
            return of(false);
        }

        return userService.getCurrentUser().pipe(
            map(user => {
                const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
                if (!requiredRoles  || roles.includes(user.role.id)) {
                    return true;
                } else {
                    router.navigate(['/not-found']);
                    return false;
                }
            }),
            catchError(() => {
                authService.logout();
                return of(false);
            })
        );
    };
}


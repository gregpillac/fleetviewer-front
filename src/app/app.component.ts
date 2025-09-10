import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {SideMenuComponent} from './components/side-menu/side-menu.component';
import {filter} from 'rxjs';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth/auth.service';
import {UserService} from './services/user/user.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, SideMenuComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'fleetviewer-front';
    showLayout = true;

    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService
    ) {
        // On écoute les changements de route
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event) => {
            const url = (event as NavigationEnd).urlAfterRedirects;
            this.showLayout = !url.startsWith('/login'); // ← MASQUE le layout si on est sur /login
        });
        this.loadCurrentUser(); // ← charge le current
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                // On réinitialise les classes CSS du body
                document.body.classList.value = '';

                // Ajoute une classe CSS selon le rôle de l'utilisateur
                if (this.authService.isAdmin()) {
                    document.body.classList.add('ADMIN');
                } else if (this.authService.isManager()) {
                    document.body.classList.add('MANAGER');
                } else if (this.authService.isUser()) {
                    document.body.classList.add('USER');
                }
            }
        });
    }

    // Méthode pour récupérer l'utilisateur courant
    loadCurrentUser() {
        if (sessionStorage.getItem('token')) {
            this.userService.getCurrentUser().subscribe({
                next: user => this.authService.setCurrentUser(user),
                error: () => this.authService.setCurrentUser(null)
            });
        }
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    get isManager(): boolean {
        return this.authService.isManager();
    }
}

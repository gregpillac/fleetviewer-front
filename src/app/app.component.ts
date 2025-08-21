import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {filter} from 'rxjs';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth/auth.service';
import {UserService} from './services/user/user.service';

@Component({
    selector: 'app-root', // Nom de la balise HTML qui représente ce composant
    standalone: true, // Angular 15+ : composant autonome, pas besoin de NgModule
    imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent], // Modules et composants utilisés ici
    templateUrl: './app.component.html', // Template associé
    styleUrl: './app.component.scss' // Styles spécifiques à ce composant
})
export class AppComponent implements OnInit {
    title = 'fleetviewer-front'; // Titre de l'application (non utilisé directement ici)
    showLayout = true; // Permet de savoir si on affiche header/footer ou non

    constructor(
        private router: Router, // Service Angular pour naviguer et écouter les changements de route
        private authService: AuthService, // Gestion de l'authentification
        private userService: UserService // Gestion des infos utilisateur
    ) {
        // On écoute les changements de route
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd) // On ne garde que les fins de navigation
        ).subscribe((event) => {
            const url = (event as NavigationEnd).urlAfterRedirects;
            // Si on est sur /login → on cache le layout (header/footer)
            this.showLayout = !url.startsWith('/login');
        });

        // On charge l'utilisateur courant si un token existe
        this.loadCurrentUser();
    }

    ngOnInit() {
        // On écoute le changement de l'utilisateur courant
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

    // Méthode pour récupérer l'utilisateur courant depuis l'API
    loadCurrentUser() {
        if (sessionStorage.getItem('token')) { // Vérifie si un token est présent
            this.userService.getCurrentUser().subscribe({
                next: user => this.authService.setCurrentUser(user), // Stocke l'utilisateur si succès
                error: () => this.authService.setCurrentUser(null) // Sinon, remet à null
            });
        }
    }
}

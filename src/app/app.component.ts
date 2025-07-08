import {Component} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {filter} from 'rxjs';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth/auth.service';
import {UserService} from './services/user/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fleetviewer-front';
  showLayout = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      this.showLayout = !url.startsWith('/login'); // ← MASQUE le layout si on est sur /login
    });
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    if (sessionStorage.getItem('token')) {
      this.userService.getCurrentUser().subscribe({
        next: user => this.authService.setCurrentUser(user),
        error: () => this.authService.setCurrentUser(null)
      });
    }
  }



}

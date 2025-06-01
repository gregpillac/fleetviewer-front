import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {SvgIconComponent} from 'angular-svg-icon';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    // petit timeout pour éviter fermeture avant clic
    setTimeout(() => {
      this.menuOpen = false;
    }, 200);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.menuOpen = false;
  }
}

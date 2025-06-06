import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SvgIconComponent} from 'angular-svg-icon';
import {AuthService} from '../../services/auth/auth.service';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import {UserService} from "../../services/user/user.service";
import {User} from "../../models/user.model";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, MatTooltipModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit {
  menuOpen = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = user;
        console.log(user, 'USER');
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isManager(): boolean {
    return this.authService.isManager();
  }

  get isUser(): boolean {
    return this.authService.isUser();
  }



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

  protected readonly isSecureContext = isSecureContext;
}

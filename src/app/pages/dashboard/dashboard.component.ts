import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-dashboard',
    imports: [
        RouterOutlet,
        RouterLinkActive,
        RouterLink,
        NgIf
    ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    constructor(public router: Router) {}

    isOnHub(): boolean {
        return this.router.url === '/dashboard' || this.router.url === '/dashboard/';
    }
}

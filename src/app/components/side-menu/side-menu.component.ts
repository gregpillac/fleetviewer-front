import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {NgIf} from '@angular/common';
import {AuthService} from '../../services/auth/auth.service';
import {ReservationService} from '../../services/reservation.service';

@Component({
    selector: 'app-side-menu',
    standalone: true,
    imports: [
        RouterLink, RouterLinkActive,
        MatExpansionModule, MatIconModule, MatListModule,
        MatButtonModule, MatTooltipModule, NgIf
    ],
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
    collapsed = false;

    constructor(
        private authService: AuthService,
        private reservationService: ReservationService
    ) {}

    toggle() {
        this.collapsed = !this.collapsed;
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    get isManager(): boolean {
        return this.authService.isManager();
    }
}

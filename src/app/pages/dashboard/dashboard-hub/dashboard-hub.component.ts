import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Person} from '../../../models/person.model';
import {PersonService} from '../../../services/person/person.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {forkJoin} from 'rxjs';
import {VehicleService} from '../../../services/vehicle/vehicle.service';
import {Vehicle} from '../../../models/vehicle';
import {AuthService} from '../../../services/auth/auth.service';
import {ReservationService} from '../../../services/reservation.service';
import {Reservation} from '../../../models/reservation';
import {MatIcon} from '@angular/material/icon';

type Dashboard = {
    key: 'persons' | 'vehicles' | 'reservations';  // tes sources
    route: string;
    title: string;
    icon: string;
    count: number | null; // null = loading
};

@Component({
    selector: 'app-dashboard-hub',
    imports: [
        NgForOf,
        NgIf,
        MatIcon
    ],
    templateUrl: './dashboard-hub.component.html',
    styleUrl: './dashboard-hub.component.scss'
})
export class DashboardHubComponent implements OnInit {
    persons: Person[] | null = null;
    vehicles: Vehicle[] | null = null;
    reservations: Reservation[] | null = null;

    dashboards: Dashboard[] = [
        {
            key: 'persons', // données
            route: 'users',
            title: 'Utilisateurs',
            icon: 'group',
            count: null
        },
        {
            key: 'vehicles',
            route: 'vehicles',
            title: 'Véhicules',
            icon: 'directions_car',
            count: null
        },
        {
            key: 'reservations',
            route: 'reservations',
            title: 'Réservations ',
            icon: 'event',
            count: null
        }
    ];

    constructor(
        private router: Router,
        private personService: PersonService,
        private vehicleService: VehicleService,
        private reservationService: ReservationService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
        forkJoin({
            persons: this.isAdmin ? this.personService.getPersons() : this.personService.getPersonsByPlace(this.currentUserPlace),
            vehicles: this.isAdmin ? this.vehicleService.getVehicles() : this.vehicleService.getVehiclesByPlace(this.currentUserPlace),
            reservations: this.reservationService.getAllReservations()
        }).subscribe(({ persons, vehicles, reservations }) => {
            this.persons = persons;
            this.vehicles = vehicles;

            // ---------- filtrage des réservations pour manager ----------
            const scopedReservations = this.isAdmin
                ? reservations
                : (() => {
                    const allowedVehicleIds = new Set(
                        (vehicles ?? []).map(v => Number((v as any).id)).filter(Number.isFinite)
                    );
                    return (reservations ?? []).filter(r => {
                        const vid = Number((r as any).vehicleId ?? (r as any).vehicle_id);
                        return Number.isFinite(vid) && allowedVehicleIds.has(vid);
                    });
                })();

            this.reservations = scopedReservations;

            // KPI
            this.setCount('persons', persons?.length ?? 0);
            this.setCount('vehicles', vehicles?.length ?? 0);
            this.setCount('reservations', scopedReservations?.length ?? 0);
        });
    }

    private setCount(key: Dashboard['key'], n: number) {
        const d = this.dashboards.find(x => x.key === key);
        if (d) d.count = n;
    }

    navTo(path: string): void {
        this.router.navigate([`/dashboard/${path}`]).then();
    }


    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    get isManager(): boolean {
        return this.authService.isManager();
    }

    get currentUserPlace(): string {
        return this.authService.getCurrentUser()?.person?.place?.name ?? '';
    }

}

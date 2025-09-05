import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Person} from '../../../models/person.model';
import {PersonService} from '../../../services/person/person.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {forkJoin} from 'rxjs';
import {VehicleService} from '../../../services/vehicleService/vehicle.service';
import {Vehicle} from '../../../models/vehicle';

type Dashboard = {
    key: 'persons' | 'vehicles' | 'places';  // tes sources
    route: string;
    title: string;
    count: number | null; // null = loading
};

@Component({
    selector: 'app-dashboard-hub',
    imports: [
        NgForOf,
        NgClass,
        NgIf
    ],
    templateUrl: './dashboard-hub.component.html',
    styleUrl: './dashboard-hub.component.scss'
})
export class DashboardHubComponent implements OnInit {
    persons: Person[] | null = null;
    vehicles: Vehicle[] | null = null;

    dashboards: Dashboard[] = [
        {
            key: 'persons', // données
            route: 'users',
            title: 'Utilisateurs',
            count: null
        },
        {
            key: 'vehicles',
            route: 'vehicles',
            title: 'Véhicules',
            count: null
        }
    ];

    constructor(
        private router: Router,
        private personService: PersonService,
        private vehicleService: VehicleService,
    ) {}

    ngOnInit() {
        forkJoin({
            persons: this.personService.getPersons(),
            vehicles: this.vehicleService.getVehicles(),

        }).subscribe(({ persons, vehicles }) => {
            this.persons = persons;
            this.vehicles = vehicles;

            this.setCount('persons', persons.length);
            this.setCount('vehicles', vehicles.length);
        });
    }

    private setCount(key: Dashboard['key'], n: number) {
        const d = this.dashboards.find(x => x.key === key);
        if (d) d.count = n;
    }

    navTo(path: string): void {
        this.router.navigate([`/dashboard/${path}`]).then();
    }

}

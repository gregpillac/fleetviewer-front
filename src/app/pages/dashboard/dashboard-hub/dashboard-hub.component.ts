import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Person} from '../../../models/person.model';
import {PersonService} from '../../../services/person/person.service';
import {I18nPluralPipe, NgForOf, NgIf} from '@angular/common';
import {forkJoin} from 'rxjs';

type Dashboard = {
    key: 'persons' | 'vehicles' | 'places';  // tes sources
    route: string;
    title: string;
    count: number | null; // null = loading
    plural: { [k: string]: string }; // i18nPlural map
};

@Component({
    selector: 'app-dashboard-hub',
    imports: [
        I18nPluralPipe,
        NgForOf
    ],
    templateUrl: './dashboard-hub.component.html',
    styleUrl: './dashboard-hub.component.scss'
})
export class DashboardHubComponent implements OnInit {
    persons: Person[] | null = null;
    //vehicles: Vehicle[] | null = null;

    dashboards: Dashboard[] = [
        {
            key: 'persons', // données
            route: 'users',
            title: 'Utilisateurs',
            count: null,
            plural: {
                '=0': "Il n'y a aucun utilisateur",
                '=1': "Il y a 1 utilisateur",
                other: "Il y a # utilisateurs",
            },
        },
        {
            key: 'vehicles',
            route: 'vehicles',
            title: 'Véhicules',
            count: null,
            plural: {
                '=0': "Il n'y aucun véhicule",
                '=1': "Il y a 1 véhicule",
                other: "Il y a # véhicules",
            },
        }
    ];

    constructor(
        private router: Router,
        private personService: PersonService
    ) {}

    ngOnInit() {
        forkJoin({
            persons: this.personService.getPersons(),
            //vehicles: this.vehicleService.getVehicles(),

        }).subscribe(({ persons/*, vehicles*/ }) => {
            this.persons = persons;
            //this.vehicles = vehicles;

            this.setCount('persons', persons.length);
            //this.setCount('vehicles', vehicles.length);
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

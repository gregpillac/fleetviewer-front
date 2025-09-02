import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Person} from '../../../models/person.model';
import {PersonService} from '../../../services/person/person.service';

@Component({
  selector: 'app-dashboard-hub',
  imports: [],
  templateUrl: './dashboard-hub.component.html',
  styleUrl: './dashboard-hub.component.scss'
})
export class DashboardHubComponent implements OnInit {
  persons: Person[] = [];

  constructor(
    private router: Router,
    private personService: PersonService
  ) {}

  ngOnInit() {
    this.personService.getPersons().subscribe(persons => {
      this.persons = persons;
    })
  }

  navTo(path: string): void {
    this.router.navigate([`/dashboard/${path}`]).then();
  }

}

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../../../models/user.model';
import {UserService} from '../../../services/user/user.service';

@Component({
  selector: 'app-dashboard-hub',
  imports: [],
  templateUrl: './dashboard-hub.component.html',
  styleUrl: './dashboard-hub.component.scss'
})
export class DashboardHubComponent implements OnInit {
  users: User[] = [];

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    })
  }

  navTo(path: string): void {
    this.router.navigate([`/dashboard/${path}`]);
  }

}

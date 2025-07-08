import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/user/user.service';
import {User} from '../../../models/user.model';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';

@Component({
  selector: 'app-dashboard-users',
  imports: [
    MatTable,
    MatHeaderRow,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    MatRowDef,
    MatHeaderRowDef,
    MatRow
  ],
  templateUrl: './dashboard-users.component.html',
  styleUrl: './dashboard-users.component.scss'
})
export class DashboardUsersComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['username', 'fullname', 'email', 'phone', 'place', 'role'];

  constructor(
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(users => {
      const rolePriority: { [key: string]: number } = { 'ROLE_ADMIN': 1, 'ROLE_MANAGER': 2, 'ROLE_USER': 3 };

      this.users = users.sort((a, b) => {
        return rolePriority[a.role.id] - rolePriority[b.role.id];
      });
    });
  }

  getFullName(user: any): string {
    return `${user.person.firstName} ${user.person.lastName}`;
  }
}

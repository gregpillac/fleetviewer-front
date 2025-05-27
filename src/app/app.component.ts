import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SvgIconComponent} from 'angular-svg-icon';
import {User, UserService} from './services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SvgIconComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fleetviewer-front';
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Erreur de chargement des utilisateurs', err)
    });
  }
}

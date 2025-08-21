import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user/user.service'; // Service pour récupérer les utilisateurs
import { User } from '../../../models/user.model'; // Modèle TypeScript représentant un utilisateur
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from '@angular/material/table'; // Imports Angular Material pour le tableau

@Component({
  selector: 'app-dashboard-users', // Balise HTML de ce composant
  imports: [
    // Import des composants Angular Material nécessaires pour afficher le tableau
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
  templateUrl: './dashboard-users.component.html', // Template HTML
  styleUrl: './dashboard-users.component.scss'     // Styles CSS
})
export class DashboardUsersComponent implements OnInit {
  
  // Tableau qui contiendra les utilisateurs à afficher dans le tableau
  users: User[] = [];

  // Liste des colonnes affichées dans le tableau (même ordre que dans le HTML)
  displayedColumns: string[] = ['username', 'fullname', 'email', 'phone', 'place', 'role'];

  constructor(
    private userService: UserService // Injection du service pour interagir avec l'API utilisateur
  ) {}

  ngOnInit() {
    // Au chargement du composant, on récupère la liste des utilisateurs
    this.userService.getUsers().subscribe(users => {
      
      // Définition d'une priorité pour l'ordre des rôles
      const rolePriority: { [key: string]: number } = { 
        'ROLE_ADMIN': 1, 
        'ROLE_MANAGER': 2, 
        'ROLE_USER': 3 
      };

      // Trie les utilisateurs en fonction de leur rôle, en utilisant la priorité définie
      this.users = users.sort((a, b) => {
        return rolePriority[a.role.id] - rolePriority[b.role.id];
      });
    });
  }

  // Concatène le prénom et le nom de l'utilisateur pour l'affichage
  getFullName(user: any): string {
    return `${user.person.firstName} ${user.person.lastName}`;
  }
}

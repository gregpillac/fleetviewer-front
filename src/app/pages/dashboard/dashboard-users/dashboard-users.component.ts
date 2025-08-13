import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../services/user/user.service';
import {User} from '../../../models/user.model';
import {AgGridModule} from 'ag-grid-angular';
import type {ColDef, ValueGetterParams} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { locale_fr } from '../ag-grid-locale/locale_fr'

ModuleRegistry.registerModules([ AllCommunityModule ]);


@Component({
    selector: 'app-dashboard-users',
    imports: [AgGridModule],
    templateUrl: './dashboard-users.component.html',
    styleUrl: './dashboard-users.component.scss'
})
export class DashboardUsersComponent implements OnInit {
    @ViewChild('agGrid') agGrid: any;
    localeText = locale_fr;

    users: User[] = [];

    columnDefs: ColDef<User, any>[] = [
        {
            headerName: 'Identifiant',
            filter: 'agTextColumnFilter',
            field: 'username',
        },
        {
            headerName: 'Nom',
            filter: 'agTextColumnFilter',
            valueGetter: (params: ValueGetterParams<User, any, any>) =>
                this.getFullName(params.data)
        },
        {
            headerName: 'Email',
            filter: 'agTextColumnFilter',
            valueGetter: (params: ValueGetterParams) =>
                params.data.person?.email ?? '(non renseigné)'
        },
        {
            headerName: 'Téléphone',
            filter: 'agTextColumnFilter',
            valueGetter: (params: ValueGetterParams) =>
                params.data.person?.phone ?? '(non renseigné)'
        },
        {
            headerName: 'Site',
            filter: 'agTextColumnFilter',
            valueGetter: (params: ValueGetterParams) =>
                params.data.person?.place?.name ?? '(non renseigné)'
        },
        {
            headerName: 'Rôle',
            filter: 'agTextColumnFilter',
            valueGetter: (params: ValueGetterParams) =>
                params.data.role?.id ?? '(non renseigné)'
        },
        {
            headerName: 'Actions',
            sortable: false,
            filter: false,
            pinned: 'right',
            cellRenderer: function(params: any) {
                const user = params.data;
                return `
                    <button class="ag-action-btn" data-id="${user.id}" data-action="edit"    title="Modifier">✏️</button>
                    <button class="ag-action-btn" data-id="${user.id}" data-action="delete"  title="Supprimer">🗑️</button>
                    <button class="ag-action-btn" data-id="${user.id}" data-action="toggle"  title="${user.enabled ? 'Désactiver' : 'Activer'}">
                    ${user.enabled ? '🚫' : '✅'}
                    </button>
                `;
            }
        }
    ];

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

    getFullName(user: any) {
        return user.person
            ? `${user.person.firstName ?? ''} ${user.person.lastName ?? ''}`.trim()
            : '';
    }

    editUser(user: User)    {
        alert(`Edit ${user}`);
    }

    deleteUser(user: User)  {
        alert(`Delete ${user}`);
    }

    toggleUser(user: User)  {
        alert(`Toggle ${user}`);
    }

    onGridReady(params: any) {
        params.api.addEventListener('cellClicked', (event: any) => {
            const target = event.event.target as HTMLElement;
            if (target.classList.contains('ag-action-btn')) {
                const id = Number(target.getAttribute('data-id'));
                const action = target.getAttribute('data-action');
                const user = this.users.find(u => u.id == id);
                if (!user) return; // ne rien faire si aucun user trouvé
                if (action === 'edit')    this.editUser(user);
                if (action === 'delete')  this.deleteUser(user);
                if (action === 'toggle')  this.toggleUser(user);
            }
        });
    }

    onAddUser() {
        alert('Ajouter un utilisateur');
    }

    onResetFilters() {
        // Reset tous les filtres de la grille
        if (this.agGrid && this.agGrid.api) {
            this.agGrid.api.setFilterModel(null);
            this.agGrid.api.setSortModel(null);
            this.agGrid.api.onFilterChanged();
        }
    }
}

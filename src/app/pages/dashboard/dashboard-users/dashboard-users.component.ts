import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../services/user/user.service';
import {User} from '../../../models/user.model';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, GridApi, GridReadyEvent, provideGlobalGridOptions, ValueGetterParams} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { locale_fr } from '../ag-grid-locale/locale_fr'
import {filter, forkJoin, switchMap} from 'rxjs';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Person} from '../../../models/person.model';
import {PersonService} from '../../../services/person/person.service';
import {DashboardUsersFormComponent} from './dashboard-users-form/dashboard-users-form.component';
import {NgIf} from '@angular/common';
import {
    DashboardUsersDeleteDialogComponent
} from './dashboard-users-delete-dialog/dashboard-users-delete-dialog.component';


ModuleRegistry.registerModules([ AllCommunityModule ]);
provideGlobalGridOptions({theme: "legacy"});
type ViewMode = 'list' | 'create' | 'edit';
type Mode = 'create' | 'edit';

@Component({
    selector: 'app-dashboard-users',
    imports: [AgGridAngular, DashboardUsersFormComponent, NgIf, MatDialogModule],
    templateUrl: './dashboard-users.component.html',
    styleUrl: './dashboard-users.component.scss'
})
export class DashboardUsersComponent implements OnInit {
    @ViewChild('agGrid') agGrid: any;
    localeText = locale_fr;
    columnDefs: ColDef[] = [
        {
            headerName: 'Prénom & Nom',
            field: 'name',
            filter: 'agTextColumnFilter',
            sortable: true,
            valueGetter: (params: ValueGetterParams<Person, any, any>) =>
                this.getFullName(params.data)
        },
        {
            headerName: 'Email',
            field: 'email',
            filter: 'agTextColumnFilter',
            sortable: true,
            valueGetter: (params: ValueGetterParams) =>
                params.data?.email ?? '(non renseigné)'
        },
        {
            headerName: 'Téléphone',
            field: 'phone',
            filter: 'agTextColumnFilter',
            sortable: true,
            valueGetter: (params: ValueGetterParams) =>
                params.data?.phone ?? '(non renseigné)'
        },
        {
            headerName: 'Site',
            field: 'place',
            filter: 'agTextColumnFilter',
            sortable: true,
            valueGetter: (params: ValueGetterParams) =>
                params.data?.place?.name ?? '(non renseigné)'
        },
        {
            headerName: 'Compte associé',
            field: 'username',
            filter: 'agTextColumnFilter',
            sortable: true,
            valueGetter: (p) => this.usersByPersonId.get(p.data.id)?.username ?? '—'
        },
        {
            headerName: 'Rôle',
            field: 'role',
            filter: 'agTextColumnFilter',
            sortable: true,
            valueGetter: (p) => this.usersByPersonId.get(p.data.id)?.role?.id ?? '—',
            valueFormatter: (params) => {
                switch (params.value) {
                    case 'ROLE_ADMIN': return 'Administrateur';
                    case 'ROLE_MANAGER': return 'Manager';
                    case 'ROLE_USER': return 'Utilisateur';
                    case 'ROLE_DEFAULT': return 'Restreint';
                    default: return params.value;
                }
            },
            comparator: (a: string, b: string) => {
                const order = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER', 'ROLE_DEFAULT', '—'];
                const ia = order.indexOf(a), ib = order.indexOf(b);
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            },
            sort: 'asc'
        },
        {
            headerName: 'Actions',
            filter: false,
            sortable: false,
            pinned: 'right',
            minWidth: 220,
            cellRenderer: (params: any) => {
                const person = params.data as Person;
                const user = this.usersByPersonId.get(person.id) || null;

                return `
                        <div class="ag-actions">
                            <button class="ag-action-btn" data-person-id="${person.id}" data-action="edit" title="Modifier">✏️</button>
                            ${ user ? `
                            <button class="ag-action-btn" data-person-id="${person.id}" data-action="toggle" title="${user.enabled ? 'Désactiver' : 'Activer'}">
                              ${user.enabled ? '🚫' : '✅'}
                            </button>
                            ` : '' }

                            <button class="ag-action-btn" data-person-id="${person.id}" data-action="delete" title="${user ? 'Supprimer' : 'Supprimer l\'utilisateur'}">
                                ${user ? '🗑️ ▾' : '🗑️'}
                            </button>
                        </div>
                    `;
            }
        }
    ];
    gridApi!: GridApi;

    persons: Person[] = [];
    users: User[] = [];
    usersByPersonId = new Map<number, User>();

    view: ViewMode = 'list';
    editingPerson: Person | null = null;
    editingUser: User | null = null;

    constructor(
        private personService: PersonService,
        private userService: UserService,
        private snack: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.refreshData();
    }

    // Expose seulement 'create' | 'edit' (ou null) pour le template, afin d'éviter que 'list' soit passé à [mode]
    get formMode(): Mode | null {
        return this.view === 'list' ? null : this.view; // ← ici le type est réduit à Mode
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api; // GridApi (filtrage, refresh…)

        params.api.addEventListener('cellClicked', (event: any) => {
            const target = event.event.target as HTMLElement;
            if (!target.classList.contains('ag-action-btn')) return;
            const personId = Number(target.getAttribute('data-person-id'));
            const action = target.getAttribute('data-action')!;
            const person = this.persons.find(p => p.id === personId);
            const user = this.usersByPersonId.get(personId) || null;

            if (!person) return;
            if (action === 'edit') this.openEditUser(person);
            if (action === 'toggle' && user) this.toggleUser(user);
            if (action === 'delete') this.handleDeleteClick(person);
        });
    }

    // Recharge personnes + utilisateurs et met à jour la grille
    private refreshData(): void {
        forkJoin([
            this.personService.getPersons(),
            this.userService.getUsers()
        ]).subscribe(([persons, users]) => {
            this.persons = persons;
            this.users = users;
            this.usersByPersonId = new Map(users.map(u => [u.person.id, u]));
            this.persons = [...this.persons]; // force la rééval des valueGetters
        });
    }

    getFullName(person: any) {
        return person
            ? `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim()
            : '';
    }

    openCreateUser() {
        this.view = 'create';
        this.editingPerson = null;
        this.editingUser = null;
    }

    openEditUser(person: Person) {
        this.view = 'edit';
        this.editingPerson = person;
        this.editingUser = this.usersByPersonId.get(person.id) ?? null; // via ta Map
    }

    // Le formulaire enfant “ferme” la vue et indique s’il y a eu sauvegarde
    onFormClosed(saved: boolean) {
        this.view = 'list';
        if (saved) this.refreshData();
    }

    toggleUser(user: User)  {
        // Inverser le statut
        const newStatus = !user.enabled

        if (confirm(
            `Êtes-vous certain de vouloir ${newStatus ? "" : "dés"}activer le compte utilisateur de ${this.getFullName(user.person)} ?`))
        {
            this.userService.updateStatus(user.id, newStatus).pipe(
                switchMap(() => this.userService.getUsers())
            ).subscribe({

                next: (users) => {
                    this.users = users;
                    this.usersByPersonId = new Map(users.map(u => [u.person.id, u])); // <-- rebuild map
                    this.persons = [...this.persons]; // <-- recharge la liste
                    this.snack.open('Statut mis à jour', 'OK', { duration: 1500 });
                },
                error: () => this.snack.open('Échec de la mise à jour', 'OK', { duration: 2500 })
            });
        }
    }

    // Clic sur le boutton Supprimer
    handleDeleteClick(person: Person) {
        const user = this.usersByPersonId.get(person.id) ?? null;

        console.log('test');

        if(!user) {
            this.deleteUser(person);
        } else {
            this.openDeleteDialog(person);
        }
    }

    openDeleteDialog(pers: Person) {
        const person = this.persons.find(p => p.id === pers.id);
        if (!person) return;
        const user = this.usersByPersonId.get(pers.id) ?? null;

        const ref = this.dialog.open(DashboardUsersDeleteDialogComponent, {
            width: '420px',
            data: { person, user }
        });

        ref.afterClosed().subscribe((choice: 'account' | 'person' | undefined) => {
            if (!choice) return;
            if (choice === 'account') {
                this.deleteAccount(pers);
            } else {
                this.deleteUser(pers);
            }
        });
    }

    // supprimer le compte (lié à la personne)
    deleteAccount(person: Person) {
        if (person.id == null) return;
        const user = this.usersByPersonId.get(person.id);
        if (!user) { this.snack.open('Aucun compte lié', 'OK', { duration: 1500 }); return; }

        if(confirm(`Êtes-vous sûr de vouloir supprimer le compte ${user.username}`)) {
            this.userService.delete(user.id).subscribe({
                next: () => {
                    this.refreshData();
                    this.snack.open('Compte supprimé', 'OK', { duration: 1500 });
                },
                error: () => this.snack.open('Échec suppression du compte', 'OK', { duration: 2500 })
            });
        }
    }

    // supprimer la personne (le compte sautera via cascade DB)
    deleteUser(person: Person) {
        if (person.id == null) return;

        if(confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${this.getFullName(person)}`)) {
            this.personService.delete(person.id).subscribe({
                next: () => {
                    this.refreshData();
                    this.snack.open('Utilisateur supprimé', 'OK', { duration: 1500 });
                },
                error: () => this.snack.open('Échec suppression de l\'utilisateur', 'OK', { duration: 2500 })
            });
        }
    }

    onResetFilters() {
        // Reset tous les filtres / tris de la grille
        if (this.agGrid && this.agGrid.api) {
            this.agGrid.api.setFilterModel(null);
            this.agGrid.api.onFilterChanged();
            this.agGrid.api.applyColumnState({
                defaultState: { sort: null } // supprime le tri sur toutes les colonnes
            });
        }
    }
}

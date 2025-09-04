import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Person } from '../../../models/person.model';
import { User } from '../../../models/user.model';
import { PersonService } from '../../../services/person/person.service';
import { UserService } from '../../../services/user/user.service';
import { DashboardUsersDeleteDialogComponent } from './dashboard-users-delete-dialog/dashboard-users-delete-dialog.component';
import {MatPaginator, MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTooltip} from '@angular/material/tooltip';

type Row = Person & {
    account?: User | null;
    roleLabel?: string;
};

@Component({
    selector: 'app-dashboard-users',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatSort,
        MatTooltip
    ],
    templateUrl: './dashboard-users.component.html',
    styleUrl: './dashboard-users.component.scss',
    providers: [
        { provide: MatPaginatorIntl, useFactory: frenchMatPaginatorIntl }
    ]
})
export class DashboardUsersComponent implements OnInit {
    private _paginator!: MatPaginator;
    @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) {
        if (p) {
            this._paginator = p;
            this.dataSource.paginator = p;
        }
    }
    // tailles de page
    pageSize = 25;
    pageSizeOptions = [10, 25, 50, 100];

    // Table
    displayedColumns = ['name', 'email', 'phone', 'place', 'username', 'role', 'actions'];
    dataSource = new MatTableDataSource<Row>([]);

    // État
    loading = true;

    constructor(
        private personService: PersonService,
        private userService: UserService,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        // prédicat de filtrage (multi-colonnes)
        this.dataSource.filterPredicate = (row, filter) => {
            const t = (v: any) => (v ?? '').toString().toLowerCase();
            const haystack = [
                `${row.firstName ?? ''} ${row.lastName ?? ''}`,
                row.email,
                row.phone,
                row.place?.name,
                row.account?.username,
                row.roleLabel,
            ]
                .map(t)
                .join(' ');
            return haystack.includes(t(filter));
        };

        this.fetchRows();
    }

    // --------- Data ---------
    private fetchRows(): void {
        this.loading = true;
        forkJoin({
            persons: this.personService.getPersons(),
            users: this.userService.getUsers(),
        }).subscribe({
            next: ({ persons, users }) => {
                const byPersonId = new Map(users.map((u) => [u.person.id, u]));
                const rows: Row[] = persons.map((p) => {
                    const account = byPersonId.get(p.id) ?? null;
                    return {
                        ...p,
                        account,
                        roleLabel: this.roleLabel(account?.role?.id),
                    };
                });
                rows.sort(this.compareRows);
                this.dataSource.data = rows;

                this.loading = false;
            },
            error: () => {
                this.dataSource.data = [];
                this.loading = false;
            },
        });
    }

    applyFilter(value: string) {
        this.dataSource.filter = (value || '').trim().toLowerCase();
        if (this._paginator) this._paginator.firstPage();
    }

    // --------- Actions ---------
    goToCreateUser() {
        this.router.navigate(['dashboard/users', 'new']);
    }

    editUser(row: Row) {
        this.router.navigate(['dashboard/users', row.id]);
    }

    toggleUser(user: User) {
        const newStatus = !user.enabled;
        const actionLabel = newStatus ? 'activer' : 'désactiver';
        const fullName = `${user.person?.firstName ?? ''} ${user.person?.lastName ?? ''}`.trim();

        if (!confirm(`Voulez-vous ${actionLabel} le compte de ${fullName || 'cet utilisateur'} ?`)) return;

        this.userService.updateStatus(user.id, newStatus).subscribe({
            next: () => {
                // maj en place + “tick” la datasource pour refléter l’UI
                user.enabled = newStatus;
                this.dataSource.data = [...this.dataSource.data];
            },
            error: () => alert('Échec de la mise à jour du statut du compte.'),
        });
    }

    onDeleteClick(row: Row) {
        if (!row.account) this.deleteUser(row);
        else this.openDeleteDialog(row);
    }

    openDeleteDialog(row: Row) {
        const ref = this.dialog.open(DashboardUsersDeleteDialogComponent, {
            width: '420px',
            data: { person: row, user: row.account },
        });

        ref.afterClosed().subscribe((choice: 'account' | 'person' | undefined) => {
            if (!choice) return;
            if (choice === 'account') this.deleteAccount(row);
            else this.deleteUser(row);
        });
    }

    deleteAccount(row: Row) {
        const user = row.account;
        if (!user) return;

        if (!confirm(`Supprimer le compte ${user.username} ?`)) return;

        this.userService.delete(user.id).subscribe({
            next: () => {
                row.account = null;
                row.roleLabel = '—';
                this.resort(); // remet l’ordre par rôles
            },
            error: () => alert('Échec de la suppression du compte.'),
        });
    }

    deleteUser(row: Row) {
        const fullName = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'cet utilisateur';
        if (!confirm(`Supprimer définitivement ${fullName} ?`)) return;

        this.personService.delete(row.id).subscribe({
            next: () => {
                this.dataSource.data = this.dataSource.data.filter((r) => r.id !== row.id);
            },
            error: () => alert("Échec de la suppression de l'utilisateur."),
        });
    }


    // --------- Comparateur des rôles pour le tri de la datasource ---------
    private roleRank(row: Row): number {
        const id = row.account?.role?.id ?? 'NONE'; // "Aucun"
        switch (id) {
            case 'ROLE_ADMIN':   return 0;
            case 'ROLE_MANAGER': return 1;
            case 'ROLE_USER':    return 2;
            case 'ROLE_DEFAULT': return 3;
            case 'NONE':         return 4;
            default:             return 99;
        }
    }

    private compareRows = (a: Row, b: Row) => {
        const ra = this.roleRank(a), rb = this.roleRank(b);
        if (ra !== rb) return ra - rb;

        // tie-breakers : Nom puis Prénom (ordre alpha FR, case-insensitive)
        const lnA = (a.lastName  ?? '').toLowerCase();
        const lnB = (b.lastName  ?? '').toLowerCase();
        if (lnA !== lnB) return lnA.localeCompare(lnB, 'fr');

        const fnA = (a.firstName ?? '').toLowerCase();
        const fnB = (b.firstName ?? '').toLowerCase();
        return fnA.localeCompare(fnB, 'fr');
    };

    private resort() {
        this.dataSource.data = [...this.dataSource.data].sort(this.compareRows);
    }

    // --------- Helpers ---------
    fullName(p: Person) {
        return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
    }

    roleLabel(roleId?: string): string {
        switch (roleId) {
            case 'ROLE_ADMIN':
                return 'Administrateur';
            case 'ROLE_MANAGER':
                return 'Manager';
            case 'ROLE_USER':
                return 'Utilisateur';
            case 'ROLE_DEFAULT':
                return 'Restreint';
            default:
                return '—';
        }
    }
}

// Labels FR
export function frenchMatPaginatorIntl(): MatPaginatorIntl {
    const intl = new MatPaginatorIntl();
    intl.itemsPerPageLabel = 'Éléments par page';
    intl.nextPageLabel = 'Page suivante';
    intl.previousPageLabel = 'Page précédente';
    intl.firstPageLabel = 'Première page';
    intl.lastPageLabel = 'Dernière page';
    intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) return `0 sur ${length}`;
        const start = page * pageSize;
        const end = Math.min(start + pageSize, length);
        return `${start + 1} – ${end} sur ${length}`;
    };
    return intl;
}


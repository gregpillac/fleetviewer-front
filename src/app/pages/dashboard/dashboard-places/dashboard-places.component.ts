import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Place } from '../../../models/place.model';
import { Address } from '../../../models/address.model';
import { PlaceService } from '../../../services/place/place.service';
import { AuthService } from '../../../services/auth/auth.service';
import {MatTooltip} from '@angular/material/tooltip';

// ----- Labels FR (paginator)
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

// Détail renvoyé par getPlaceById (avec address)
type PlaceDetail = Place & { address?: Address | null };

@Component({
    selector: 'app-dashboard-places',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatPaginator,
        MatProgressBar,
        MatSuffix,
        MatIcon,
        MatIconButton,
        MatTooltip
    ],
    templateUrl: './dashboard-places.component.html',
    styleUrls: ['./dashboard-places.component.scss'],
    providers: [{ provide: MatPaginatorIntl, useFactory: frenchMatPaginatorIntl }]
})
export class DashboardPlacesComponent implements OnInit {
    private _paginator!: MatPaginator;
    @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) {
        if (p) {
            this._paginator = p;
            this.dataSource.paginator = p;
        }
    }

    // Pagination
    pageSize = 25;
    pageSizeOptions = [10, 25, 50, 100];

    // Table
    displayedColumns!: string[];
    placeHolderFilter = 'Nom…';
    dataSource = new MatTableDataSource<Place>([]);
    loading = true;

    constructor(
        private placeService: PlaceService,
        private authService: AuthService,
        private router: Router
    ) {
        // Même logique que véhicules : lecture seule si non-admin (pas d'actions)
        this.displayedColumns = this.isAdmin
            ? ['name'/*, 'address', 'actions'*/]
            : ['name'/*, 'address'*/];
    }

    ngOnInit(): void {
        // Filtre simple par nom (on évite d’appeler l’API pendant le filtrage)
        this.dataSource.filterPredicate = (row: Place, filter: string) => {
            const t = (v: any) => (v ?? '').toString().toLowerCase();
            return t(row?.name).includes(t(filter));
        };

        this.fetchRows();
    }

    private fetchRows(): void {
        this.loading = true;
        this.placeService.getPlaces().subscribe({
            next: (places: Place[]) => {
                const sorted = [...(places ?? [])].sort((a, b) =>
                    (a?.name ?? '').toLowerCase().localeCompare((b?.name ?? '').toLowerCase(), 'fr')
                );
                this.dataSource.data = sorted;
                this.loading = false;
            },
            error: () => {
                this.dataSource.data = [];
                this.loading = false;
            }
        });
    }

    applyFilter(value: string) {
        this.dataSource.filter = (value || '').trim().toLowerCase();
        if (this._paginator) this._paginator.firstPage();
    }

    // ---------- Actions (masquées si non-admin) ----------
    goToCreatePlace() {
        if (!this.isAdmin) return;
        this.router.navigate(['dashboard/places/add']);
    }

    goToEditPlace(place: Place) {
        if (!this.isAdmin) return;
        this.router.navigate(['dashboard/places', place.id]);
    }

    deletePlace(p: Place) {
        if (!this.isAdmin) return;
        if (!confirm(`Supprimer définitivement le site « ${p.name} » ?`)) return;

        this.placeService.deletePlace(p.id as number).subscribe({
            next: () => {
                this.dataSource.data = this.dataSource.data.filter((x) => x.id !== p.id);
            },
            error: () => alert('Échec de la suppression du site.')
        });
    }

    // Droits
    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {Vehicle} from '../../../models/vehicle';
import {VehicleService} from '../../../services/vehicleService/vehicle.service';
import {PlaceService} from '../../../services/placeService/place.service';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {forkJoin} from 'rxjs';
import {Place} from '../../../models/place.model';
import {Router} from '@angular/router';
import {VehicleKey} from '../../../models/vehicle-key';
import {VehicleKeyService} from '../../../services/vehicle-key/vehicle-key.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

type Row = Vehicle & {
    place?: Place | null;
    keyCount: number;
};

@Component({
    selector: 'app-dashboard-vehicles',
    imports: [CommonModule, MatTableModule, MatButton, MatFormField, MatIcon, MatIconButton, MatInput, MatLabel, MatPaginator, MatProgressBar, MatSuffix, MatTooltip],
    templateUrl: './dashboard-vehicles.component.html',
    styleUrl: './dashboard-vehicles.component.scss',
    providers: [
        { provide: MatPaginatorIntl, useFactory: frenchMatPaginatorIntl }
    ]
})
export class DashboardVehiclesComponent implements OnInit {
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
    displayedColumns = ['vehicle', 'licensePlate', 'mileage', 'place', 'keys', 'actions'];
    dataSource = new MatTableDataSource<Row>([]);
    loading = true;

    vehicles: Vehicle[] = [];
    keys: VehicleKey[] = [];
    places: Place[] = [];

    // index: vehicleId -> nb de clés
    keyCountByVehicle = new Map<number, number>();

    // 👇 AJOUTS — cache des clés par véhicule + index des lieux
    rowKeysCache = new Map<number, VehicleKey[]>(); // vehicleId -> keys
    placesById = new Map<number, string>();         // placeId  -> name

    constructor(
        private vehicleService: VehicleService,
        private keyService: VehicleKeyService,
        private placeService: PlaceService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Filtrage multi-colonnes (marque, modèle, immat, lieu)
        this.dataSource.filterPredicate = (row, filter) => {
            const t = (v: any) => (v ?? '').toString().toLowerCase();
            const haystack = [
                `${row.brand ?? ''} ${row.model ?? ''}`,
                row.licensePlate,
                row.place?.name
            ]
                .map(t)
                .join(' ');
            return haystack.includes(t(filter));
        };

        this.fetchRows();
    }

    private fetchRows(): void {
        this.loading = true;

        forkJoin({
            vehicles: this.vehicleService.getVehicles(),
            keys: this.keyService.getKeys(),
            places: this.placeService.getPlaces()
        }).subscribe({
            next: ({ vehicles, keys, places }) => {
                // Index vehicleId -> count
                const keyCountByVehicle = new Map<number, number>();
                for (const k of keys) {
                    const vid = Number((k as any).vehicleId);
                    keyCountByVehicle.set(vid, (keyCountByVehicle.get(vid) ?? 0) + 1);
                }

                // 👇 garder les lieux + index id->name pour tooltips
                this.places = places;
                this.placesById = new Map(places.map(p => [Number(p.id), p.name]));

                // Construire les rows
                const rows: Row[] = vehicles.map((v) => {
                    const place = places.find((p) => Number(p.id) === Number((v as any).placeId)) ?? null;
                    return {
                        ...v,
                        place,
                        keyCount: keyCountByVehicle.get(Number(v.id)) ?? 0,
                    };
                });

                rows.sort(this.compareRows);
                this.dataSource.data = rows;
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

    // --------- Actions ---------
    goToCreateVehicle() {
        this.router.navigate(['dashboard/vehicles/add']);
    }

    goToEditVehicle(vehicle: any) {
        this.router.navigate(['dashboard/vehicles', vehicle.id]);
    }

    deleteVehicle(row: Row) {
        const fullModel = this.fullModel(row) || 'ce véhicule';
        if (!confirm(`Supprimer définitivement ${fullModel} ?`)) return;

        this.vehicleService.deleteVehicle(row.id).subscribe({
            next: () => {
                this.dataSource.data = this.dataSource.data.filter((r) => r.id !== row.id);
            },
            error: () => alert("Échec de la suppression du véhicule."),
        });
    }

    // --------- Helpers ---------
    fullModel(v: Vehicle) {
        return `${v.brand ?? ''} ${v.model ?? ''}`.trim();
    }

    private compareRows = (a: Row, b: Row) => {
        const placeA = (a.place?.name ?? '').toLowerCase();
        const placeB = (b.place?.name ?? '').toLowerCase();
        if (placeA !== placeB) return placeA.localeCompare(placeB, 'fr');

        const brandA = (a.brand ?? '').toLowerCase();
        const brandB = (b.brand ?? '').toLowerCase();
        if (brandA !== brandB) return brandA.localeCompare(brandB, 'fr');

        const modelA = (a.model ?? '').toLowerCase();
        const modelB = (b.model ?? '').toLowerCase();
        if (modelA !== modelB) return modelA.localeCompare(modelB, 'fr');

        const plateA = (a.licensePlate ?? '').toLowerCase();
        const plateB = (b.licensePlate ?? '').toLowerCase();
        return plateA.localeCompare(plateB, 'fr');
    };

    // ---------- AJOUTS: Tooltip clés ----------
    private placeName(id: number | null | undefined): string {
        return (id != null && this.placesById.has(Number(id)))
            ? (this.placesById.get(Number(id)) as string)
            : 'Site du véhicule';
    }

    private formatKeys(keys: VehicleKey[] | undefined | null): string {
        if (!keys || keys.length === 0) return 'Aucune clé';
        // ordre par id croissant (même logique que l’insertion séquentielle)
        return [...keys]
            .sort((a, b) => Number(a.id) - Number(b.id))
            .map(k => `[${k.tagLabel ?? '—'} - ${this.placeName(k.placeId)}]`)
            .join(' | '); // multilignes
    }

    /** Retourne le texte du tooltip pour une row */
    getKeysTooltip(r: Row): string {
        const cached = this.rowKeysCache.get(r.id);
        return this.formatKeys(cached);
    }

    /** Précharge les clés au survol si absentes du cache */
    prefetchKeysForRow(r: Row): void {
        if (this.rowKeysCache.has(r.id)) return;
        if (!r.keyCount) { // pas d'appel si 0
            this.rowKeysCache.set(r.id, []);
            return;
        }
        this.keyService.getKeyByVehicle(r.id).subscribe(ks => {
            this.rowKeysCache.set(r.id, ks || []);
        });
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

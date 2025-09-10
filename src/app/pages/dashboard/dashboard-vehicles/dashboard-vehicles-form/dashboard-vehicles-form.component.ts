import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Place } from '../../../../models/place.model';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { PlaceService } from '../../../../services/place/place.service';
import { VehicleKeyService } from '../../../../services/vehicle-key/vehicle-key.service';
import { VehicleKey, CreateVehicleKey } from '../../../../models/vehicle-key';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { forkJoin, of, from, concat } from 'rxjs';
import { catchError, switchMap, tap, concatMap, toArray, last, mapTo } from 'rxjs/operators';
import {AuthService} from '../../../../services/auth/auth.service';

type KeyFormValue = {
    id: number | null;
    tagLabel: string | null;
    placeId: number | null;
};

// Validation "optionnelle" d'une clé :
// - OK si totalement vide (brouillon) => n'empêche pas le submit
// - OK si tagLabel rempli (placeId pourra être par défaut au submit)
// - KO si placeId sans tagLabel
function optionalKeyValidator(group: AbstractControl): ValidationErrors | null {
    const tag = (group.get('tagLabel')?.value ?? '').trim();
    const placeId = group.get('placeId')?.value;
    if (!tag && (placeId === null || placeId === undefined || placeId === '')) return null; // brouillon
    if (tag) return null; // tag présent -> ok
    return { keyIncomplete: true }; // ex: placeId renseigné mais pas de tag
}

@Component({
    selector: 'app-vehicule',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule
    ],
    templateUrl: './dashboard-vehicles-form.component.html',
    styleUrl: './dashboard-vehicles-form.component.scss'
})
export class DashboardVehiclesFormComponent implements OnInit {

    vehicleForm!: FormGroup;
    places: Place[] = [];
    isEditMode = false;
    vehicleId?: number;

    /** snapshot des clés existantes (édition) pour calculer le diff au submit */
    private originalKeys: VehicleKey[] = [];
    private originalKeysById = new Map<number, VehicleKey>();

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private vehicleService: VehicleService,
        private placeService: PlaceService,
        private vehicleKeyService: VehicleKeyService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.initForm();

        this.placeService.getPlaces().subscribe(places => {
            this.places = places;
            // si manager, on force la valeur et on désactive
            if (this.isManager) {
                const userPlace = this.currentUserPlaceId;
                this.vehicleForm.get('placeId')!.setValue(userPlace);
                this.vehicleForm.get('placeId')!.disable(); // verrouille le champ
            }
        });
        // Édition : charge véhicule + clés
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (!id) return;

            this.isEditMode = true;
            this.vehicleId = +id;

            this.vehicleService.getVehicleById(this.vehicleId).pipe(
                tap(vehicle => {
                    this.vehicleForm.patchValue({
                        brand: vehicle.brand,
                        model: vehicle.model,
                        licensePlate: vehicle.licensePlate,
                        seats: vehicle.seats,
                        isRoadworthy: vehicle.isRoadworthy,
                        isInsuranceValid: vehicle.isInsuranceValid,
                        mileage: vehicle.mileage,
                        placeId: vehicle.placeId
                    });
                }),
                switchMap(() => this.vehicleKeyService.getKeyByVehicle(this.vehicleId!)),
                catchError(() => of([] as VehicleKey[]))
            ).subscribe(keys => {
                this.originalKeys = keys;
                this.originalKeysById = new Map(keys.map(k => [k.id, k]));
                this.replaceKeysFormArray(
                    keys.map<KeyFormValue>(k => ({
                        id: k.id,
                        tagLabel: k.tagLabel ?? null,
                        placeId: k.placeId
                    }))
                );
            });
        });
    }

    private initForm() {
        this.vehicleForm = this.fb.group({
            brand: ['', Validators.required],
            model: ['', Validators.required],
            licensePlate: ['', Validators.required],
            seats: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
            isRoadworthy: [true, Validators.required],
            isInsuranceValid: [true, Validators.required],
            mileage: [0, [Validators.required, Validators.min(0)]],
            placeId: [null, Validators.required],

            // FormArray pour les clés (brouillons + existantes)
            keys: this.fb.array<FormGroup>([])
        });
    }

    // ---------- Helpers ----------
    get keysArray(): FormArray<FormGroup> {
        return this.vehicleForm.get('keys') as FormArray<FormGroup>;
    }

    get currentVehiclePlaceId(): number | null {
        return this.vehicleForm.get('placeId')!.value ?? null;
    }

    placeName(id: number | null): string {
        if (id == null) return 'Site du véhicule';
        const p = this.places.find(pl => pl.id === id);
        return p?.name ?? 'Site du véhicule';
    }

    private buildKeyGroup(initial?: Partial<KeyFormValue>) {
        return this.fb.group({
            id: new FormControl<number | null>(initial?.id ?? null),
            tagLabel: new FormControl<string | null>(initial?.tagLabel ?? null),
            placeId: new FormControl<number | null>(initial?.placeId ?? this.currentVehiclePlaceId)
        }, { validators: optionalKeyValidator });
    }

    private replaceKeysFormArray(values: KeyFormValue[]) {
        // si tu veux figer l'ordre initial par id asc :
        values.sort((a, b) => this.normId(a.id) - this.normId(b.id));
        const fa = this.fb.array<FormGroup>(values.map(v => this.buildKeyGroup(v)));
        this.vehicleForm.setControl('keys', fa);
    }

    addKey() {
        this.keysArray.push(this.buildKeyGroup());
    }

    removeKey(index: number) {
        this.keysArray.removeAt(index);
    }

    // si tu affiches une vue triée avec [formGroup]="ctrl", préfère ceci :
    removeKeyByCtrl(ctrl: FormGroup) {
        const idx = this.keysArray.controls.indexOf(ctrl);
        if (idx > -1) this.keysArray.removeAt(idx);
    }

    // ---------- Submit ----------
    onSubmit() {
        if (this.vehicleForm.invalid) return;

        // Enlève "keys" du body envoyé au VehicleService
        const { keys, ...raw } = this.vehicleForm.getRawValue();

        const vehiclePayload = {
            brand: raw.brand as string,
            model: raw.model as string,
            licensePlate: raw.licensePlate as string,
            seats: Number(raw.seats),
            isRoadworthy: !!raw.isRoadworthy,
            isInsuranceValid: !!raw.isInsuranceValid,
            mileage: Number(raw.mileage),
            placeId: Number(raw.placeId)
        };

        // Ne garder que les clés non vides (ordre du FormArray = ordre UI)
        const draftKeys: KeyFormValue[] = (this.keysArray.value as any[])
            .filter((k: KeyFormValue) => (k?.tagLabel ?? '').toString().trim().length > 0)
            .map((k: KeyFormValue) => ({
                id: k.id ?? null,
                tagLabel: (k.tagLabel ?? '').toString().trim(),
                placeId: k.placeId ?? vehiclePayload.placeId
            }));

        if (this.isEditMode && this.vehicleId) {
            // UPDATE véhicule puis diff clés (create en séquentiel, update/delete ensuite)
            this.vehicleService.updateVehicle(this.vehicleId, /* garde comme tu as */ { id: this.vehicleId, ...vehiclePayload }).pipe(
                switchMap(() => this.applyKeyDiff(this.vehicleId!, this.originalKeys, draftKeys))
            ).subscribe({
                next: () => this.router.navigate(['/dashboard/vehicles']),
                error: () => this.router.navigate(['/dashboard/vehicles'])
            });

        } else {
            // CREATE véhicule puis CREATE des clés non vides EN SÉQUENTIEL (préserve l'ordre)
            this.vehicleService.createVehicle(vehiclePayload).pipe(
                switchMap((created: any) => {
                    if (!draftKeys.length) return of(null);
                    return from(draftKeys).pipe(
                        concatMap(k => this.vehicleKeyService.create({
                            vehicleId: created.id,
                            tagLabel: k.tagLabel,
                            placeId: Number(k.placeId)
                        } as CreateVehicleKey)),
                        toArray() // attendre la fin
                    );
                })
            ).subscribe({
                next: () => this.router.navigate(['/dashboard/vehicles']),
                error: () => this.router.navigate(['/dashboard/vehicles'])
            });
        }
    }

    returnDashboard() {
        this.router.navigate(['dashboard/vehicles']);
    }

    /** Applique le diff entre originalKeys et les clés saisies:
     *  CREATE (séquentiel, pour préserver l'ordre) puis UPDATE/DELETE (parallèle)
     */
    private applyKeyDiff(
        vehicleId: number,
        original: VehicleKey[],
        current: KeyFormValue[]
    ) {
        const byId = new Map<number, VehicleKey>();
        original.forEach(k => byId.set(k.id, k));

        const toCreate: CreateVehicleKey[] = [];
        const toUpdate: VehicleKey[] = [];
        const currentIds = new Set<number>();

        for (const k of current) {
            if (!k.id) {
                toCreate.push({
                    vehicleId,
                    tagLabel: k.tagLabel ?? null,
                    placeId: (k.placeId ?? this.currentVehiclePlaceId) as number
                });
            } else {
                currentIds.add(k.id);
                const prev = byId.get(k.id);
                if (!prev) continue;

                const changed =
                    (prev.tagLabel ?? null) !== (k.tagLabel ?? null) ||
                    prev.placeId !== (k.placeId ?? prev.placeId);

                if (changed) {
                    toUpdate.push({
                        id: k.id,
                        vehicleId,
                        tagLabel: k.tagLabel ?? null,
                        placeId: (k.placeId ?? prev.placeId) as number
                    });
                }
            }
        }

        const toDeleteIds = original
            .filter(k => !currentIds.has(k.id))
            .map(k => k.id);

        // 1) CREATE en séquentiel (ordre UI)
        const create$ = toCreate.length
            ? from(toCreate).pipe(
                concatMap(k => this.vehicleKeyService.create(k)),
                toArray()
            )
            : of([]);

        // 2) UPDATE/DELETE en parallèle
        const update$ = toUpdate.length ? forkJoin(toUpdate.map(u => this.vehicleKeyService.update(u))) : of([]);
        const delete$ = toDeleteIds.length ? forkJoin(toDeleteIds.map(id => this.vehicleKeyService.delete(id))) : of([]);

        // Exécuter dans l'ordre: create (seq) -> update (par) -> delete (par)
        const ops = [create$, update$, delete$].filter(Boolean);

        if (!ops.length) return of(null);
        return concat(...ops).pipe(last(), mapTo(null), catchError(() => of(null)));
    }

    keyStatus(k: { id?: number|null; tagLabel?: string|null; placeId?: number|null }): 'new'|'modified'|'existing' {
        if (!k?.id) return 'new';
        const prev = this.originalKeysById.get(k.id);
        if (!prev) return 'existing';

        const curTag = (k.tagLabel ?? '').trim();
        const prevTag = (prev.tagLabel ?? '').trim();

        // même logique que le diff: si placeId non saisi on garde l'ancien
        const curPlace = (k.placeId ?? prev.placeId);
        const changed = (curTag !== prevTag) || (curPlace !== prev.placeId);

        return changed ? 'modified' : 'existing';
    }

    // id null (nouvelles clés) passent en dernier
    private normId = (id: number | null | undefined) =>
        id == null ? Number.MAX_SAFE_INTEGER : id;

    get sortedKeyControls(): FormGroup[] {
        return [...(this.keysArray.controls as FormGroup[])]
            .sort((a, b) => this.normId(a.value?.id) - this.normId(b.value?.id));
    }

    get sortedKeysValue(): { id?: number|null; tagLabel?: string|null; placeId?: number|null }[] {
        return this.sortedKeyControls.map(c => c.value);
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    get isManager(): boolean {
        return this.authService.isManager();
    }

    get currentUserPlaceId(): number | null {
        return this.authService.getCurrentUser()?.person?.place?.id ?? null;
    }
}

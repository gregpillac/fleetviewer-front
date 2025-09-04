import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatButtonModule }      from '@angular/material/button';
import { MatSelectModule }      from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule }     from '@angular/material/divider';

import { Person } from '../../../../models/person.model';
import {CreateUser, User} from '../../../../models/user.model';
import { Role }   from '../../../../models/role.model';
import { Place }  from '../../../../models/place.model';

import { PersonService } from '../../../../services/person/person.service';
import { UserService }   from '../../../../services/user/user.service';
import { AddressService } from '../../../../services/address/address.service';

import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {addressValidator} from '../../../../validators/address.validator';
import {RoleService} from '../../../../services/role/role.service';

@Component({
    selector: 'app-dashboard-users-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule,
        MatSelectModule, MatSlideToggleModule, MatDividerModule
    ],
    templateUrl: './dashboard-users-form.component.html',
    styleUrl: './dashboard-users-form.component.scss'
})
export class DashboardUsersFormComponent implements OnInit {
    // Route / état
    personId: number | null = null;
    get isEdit(): boolean { return this.personId !== null; }

    // Données auxiliaires
    roles: Role[] = [];
    compareRole = (a: Role | null, b: Role | null) => a?.id === b?.id;
    places: Place[] = [];

    // Compte/Adresse existants ?
    hasExistingAccount = false;
    existingUser: User | null = null;
    existingAddressId: number | null = null;

    // UI
    saving = false;

    // Form (tous obligatoires sauf line2)
    form!: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private personService: PersonService,
        private userService: UserService,
        private roleService: RoleService
        // private placeService: PlaceService,
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        this.personId = id ? Number(id) : null;

        this.form = this.fb.group({
            // Person
            firstName: ['', Validators.required],
            lastName:  ['', Validators.required],
            email:     [''],
            phone:     [''],
            place:     [null as Place | null],
            line1:     [''],
            line2:     [''],
            city:      [''],
            postalCode:[''],

            // Account
            attachAccount: [false], // utilisé seulement s'il n'y a PAS de compte existant
            username: [{ value: '', disabled: true }, Validators.required],
            role:     [{ value: null as Role | null, disabled: true }, Validators.required],
            password: [{ value: '', disabled: true }], // requis si attachAccount, optionnel en edit
            enabled:  [{ value: true, disabled: true }],
        }, { validators: [addressValidator()] });

        // TODO: Charger les places (assure-toi que ce sont des Place existants avec id)
        /*this.placeService.getPlaces().subscribe({
            next: (places) => (this.places = places),
            error: () => (this.places = [])
        });*/

        // Chargement des rôles
        const roles$ = this.roleService.getRoles();

        if (!this.isEdit) {
            roles$.subscribe({
                next: (roles) => {
                    this.roles = roles ?? [];
                    this.setupToggleForCreate();
                },
                error: () => {
                    this.roles = [];
                    this.setupToggleForCreate();
                }
            });
            return;
        }

        // Édition : charger Person + Users, déterminer compte/adresse existants
        forkJoin({
            roles:  roles$,
            person: this.personService.getPersonById(this.personId!),
            users:  this.userService.getUsers()
        }).subscribe(({ roles, person, users }) => {
            this.roles = roles ?? [];

            const account = users.find(u => u.person.id === person.id) ?? null;
            this.hasExistingAccount = !!account;
            this.existingUser = account;
            this.existingAddressId = person.address?.id ?? null;

            // Patch Person
            this.form.patchValue({
                firstName: person.firstName,
                lastName:  person.lastName,
                email:     person.email ?? '',
                phone:     person.phone ?? '',
                place:     person.place ?? null,
                line1:     person.address?.addressFirstLine ?? '',
                line2:     person.address?.addressSecondLine ?? '',
                city:      person.address?.city ?? '',
                postalCode:person.address?.postalCode ?? '',
            });

            // Activer la zone compte (password optionnel)
            if (this.hasExistingAccount) {
                // Trouver l’instance Role depuis la liste
                const roleFromList =
                    this.roles.find(r => r.id === account!.role?.id) ?? null;
                this.enableAccountControls(true, /*requirePassword*/ false);
                this.form.patchValue({
                    username: account!.username,
                    role:     roleFromList,
                    enabled:  account!.enabled
                });
            } else {
                // Pas de compte → proposer le toggle pour associer un compte
                this.setupToggleForCreate();
            }

            // Forcer la réévaluation des validators de groupe (adresse, etc.)
            this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        });
    }

    // === Helpers UI/Validators ===

    /** Active/désactive les contrôles compte et règle les validators dynamiquement */
    private enableAccountControls(on: boolean, requirePassword: boolean) {
        const method = on ? 'enable' : 'disable';
        this.form.get('username')![method]();
        this.form.get('role')![method]();
        this.form.get('password')![method]();
        this.form.get('enabled')![method]();

        // validators
        if (on) {
            this.form.get('username')!.setValidators(Validators.required);
            this.form.get('role')!.setValidators(Validators.required);
            this.form.get('password')!.setValidators(requirePassword ? Validators.required : []);
        } else {
            this.form.get('username')!.clearValidators();
            this.form.get('role')!.clearValidators();
            this.form.get('password')!.clearValidators();
            this.form.patchValue({ username: '', role: null, password: '', enabled: true }, { emitEvent: false });
        }
        this.form.get('username')!.updateValueAndValidity({ emitEvent: false });
        this.form.get('role')!.updateValueAndValidity({ emitEvent: false });
        this.form.get('password')!.updateValueAndValidity({ emitEvent: false });
    }

    /** Active le toggle "Associer un compte" (création de compte) */
    private setupToggleForCreate() {
        const toggle = this.form.get('attachAccount')!;
        // état initial
        this.enableAccountControls(!!toggle.value, /*requirePassword*/ !!toggle.value);
        // réagit aux changements
        toggle.valueChanges.subscribe((v: boolean) => {
            this.enableAccountControls(v, /*requirePassword*/ v);
        });
    }

    /** Pour les mat-error dans le template */
    public hasError(ctrlName: string, error: string): boolean {
        const c = this.form.get(ctrlName);
        return !!c && c.hasError(error) && (c.touched || c.dirty);
    }

    // === Actions ===

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.saving = true;

        const raw = this.form.getRawValue();

        // Sauver / mettre à jour l'Address d'abord
        const addressBody = {
            addressFirstLine: raw.line1!,
            addressSecondLine: raw.line2 || null,
            city: raw.city!,
            postalCode: raw.postalCode!,
        };

        // --------- CREATE ---------
        if (!this.isEdit) {
            const personCreate = {
                firstName: raw.firstName!,
                lastName:  raw.lastName!,
                email:     raw.email!,
                phone:     raw.phone!,
                place:     raw.place!,      // objet Place existant (avec id)
                address:   addressBody,     // <-- NO id, cascade PERSIST s'en charge
            };

            this.personService.create(personCreate as any).pipe(
                switchMap((person) => {
                    if (!raw.attachAccount) return of(null);
                    return this.userService.create({
                        username: raw.username!,
                        password: raw.password!,   // requis à la création du compte
                        enabled:  !!raw.enabled,
                        role:     raw.role!,
                        person
                    } as any);
                })
            ).subscribe({
                next: () => { this.saving = false; this.returnDashboard() },
                error: (err) => { this.saving = false; console.error(err); }
            });

            return;
        }

        // --------- UPDATE ---------
        const personUpdate: Person = {
            id:        this.personId!,
            firstName: raw.firstName!,
            lastName:  raw.lastName!,
            email:     raw.email!,
            phone:     raw.phone!,
            place:     raw.place!,
            address:   {
                id: this.existingAddressId!,  // <-- id présent en édition
                ...addressBody
            } as any
        };

        this.personService.update(personUpdate).pipe(
            switchMap((person) => {
                if (this.hasExistingAccount && this.existingUser) {
                    const updatedUser: User = {
                        ...this.existingUser,
                        username: raw.username!,
                        enabled:  !!raw.enabled,
                        role:     raw.role!,
                        ...(raw.password ? { password: raw.password! } : {})
                    } as User;
                   return this.userService.update(updatedUser);
                }
                if (!this.hasExistingAccount && raw.attachAccount) {
                    return this.userService.create({
                        username: raw.username!,
                        password: raw.password!,
                        enabled:  !!raw.enabled,
                        role:     raw.role!,
                        person
                    } as CreateUser);
                }
                return of(null);
            })
        ).subscribe({
            next: () => { this.saving = false; this.returnDashboard() },
            error: (err) => { this.saving = false; console.error(err); }
        });
    }

    returnDashboard() {
        this.router.navigate(['dashboard/users']);
    }
}

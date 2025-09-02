import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {of, switchMap, map, Observable} from 'rxjs';
import {MatFormField, MatInput, MatInputModule, MatLabel} from '@angular/material/input';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatDivider} from '@angular/material/divider';
import {NgForOf, NgIf} from '@angular/common';
import {User} from '../../../../models/user.model';
import {Person, CreatePerson} from '../../../../models/person.model';
import {Role} from '../../../../models/role.model';
import {Address} from '../../../../models/address.model';
import {Place} from '../../../../models/place.model';
import {PersonService} from '../../../../services/person/person.service';
import {UserService} from '../../../../services/user/user.service';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AddressService} from '../../../../services/address/address.service';

type Mode = 'create' | 'edit';

@Component({
    selector: 'app-dashboard-users-form',
    imports: [
        MatFormField,
        MatLabel,
        FormsModule,
        ReactiveFormsModule,
        MatInput,
        MatInputModule,
        MatFormFieldModule,
        MatButton,
        MatOption,
        MatSelect,
        MatDivider,
        NgForOf,
        NgIf,
        MatSlideToggle
    ],
    templateUrl: './dashboard-users-form.component.html',
    styleUrl: './dashboard-users-form.component.scss'
})
export class DashboardUsersFormComponent implements OnInit {
    @Input() mode: Mode = 'create';
    @Input() person: Person | null = null;
    @Input() user: User | null = null;
    @Output() closed = new EventEmitter<boolean>();

    roles: Role[] = [ // en attendant un service getRoles
        { id: 'ROLE_ADMIN', description: '' },
        { id: 'ROLE_MANAGER', description: '' },
        { id: 'ROLE_USER', description: '' },
        { id: 'ROLE_DEFAULT', description: '' },
    ];

    places = [ // en attendant un service getPlaces
        { name: 'Angers' },
        { name: 'Niort' },
        { name: 'Nantes' }
    ];


    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private personService: PersonService,
        private userService: UserService,
        private addressService: AddressService
    ) {}

    ngOnInit(): void {
        // Initalisation du formulaire
        this.form = this.fb.group({
            // Person
            firstName:      ['', Validators.required],
            lastName:       ['', Validators.required],
            email:          [''],
            phone:          [''],
            place:          [null as Place | null],
            line1:      [''],
            line2:      [''],
            city:       [''],
            postalCode: [''],

            // User (optionnel -> isAccount)
            isAccount:      [false],
            username:       ['', Validators.required],
            password:       ['', this.mode === 'create' ? Validators.required : []], // requis seulement en create
            role:           [null, Validators.required],
            enabled:        [true],
        });

        // Préremplir en édition
        if (this.mode === 'edit' && this.person) {
            this.form.patchValue({
                // Person
                firstName:  this.person.firstName,
                lastName:   this.person.lastName,
                email:      this.person.email ?? '',
                phone:      this.person.phone ?? '',
                place:      this.person.place ?? null,
                line1:      this.person.address?.addressFirstLine ?? '',
                line2:      this.person.address?.addressSecondLine ?? '',
                city:       this.person.address?.city ?? '',
                postalCode: this.person.address?.postalCode ?? '',

                // User (optionnel -> isAccount)
                isAccount:  !!this.user, // on affiche la section si l’utilisateur a un compte
                username:   this.user?.username ?? '',
                role:       this.user?.role ?? null,
                enabled:    this.user?.enabled ?? true,
            });
        }

        // Désactive tout le bloc compte si isAccount = false
        const acc = ['username','role','password'].map(n => this.form.get(n)!);
        const apply = (checked: boolean) => {
            acc.forEach(c => c[checked ? 'enable' : 'disable']());
            if (!checked) this.form.patchValue({ username: '', role: null, password: '' }, { emitEvent: false });
        };

        this.form.get('isAccount')!.valueChanges.subscribe(apply);
        apply(this.form.get('isAccount')!.value); // état initial
    }

    cancel() { this.closed.emit(false); }

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched(); // force l’affichage des erreurs
            return;
        }

        const raw = this.form.getRawValue();

        // --- Règles d'adresse ---
        const hasAnyAddr = !!(raw.line1 || raw.line2 || raw.city || raw.postalCode);
        const hasCoreAddr = !!(raw.line1 && raw.city && raw.postalCode);

        if (hasAnyAddr && !hasCoreAddr) { // impose line1, city, postalCode si une adresse est commencée
            if (!raw.line1) this.form.get('line1')?.setErrors({ required: true });
            if (!raw.city) this.form.get('city')?.setErrors({ required: true });
            if (!raw.postalCode) this.form.get('postalCode')?.setErrors({ required: true });
            this.form.markAllAsTouched();
            return;
        }

        const addressPayload = {
            addressFirstLine: raw.line1,
            addressSecondLine: raw.line2 || null,
            city: raw.city,
            postalCode: raw.postalCode,
        }

        // CREATE
        if (this.mode === 'create') {
            // 1) créer adresse si besoin (sinon null)
            const address$: Observable<Address | null> = hasAnyAddr
                ? this.addressService.create(addressPayload)
                : of(null);

            address$.pipe(
                switchMap(address =>
                    this.personService.create({
                        firstName: raw.firstName!,
                        lastName:  raw.lastName!,
                        email:     raw.email || undefined,
                        phone:     raw.phone || undefined,
                        place:     raw.place,
                        address, // peut être null
                    })
                ),
                switchMap(person => {
                    if (!raw.isAccount) return of(true);
                    return this.userService.create({
                        username: raw.username!,
                        password: raw.password!,   // requis en create
                        enabled:  !!raw.enabled,
                        role:     raw.role,
                        person,
                    }).pipe(map(() => true));
                })
            ).subscribe({
                next: () => this.closed.emit(true),
                error: () => this.closed.emit(false),
            });

            return;
        }

        // --- EDIT ---
        const p$ = this.personService.update({
            ...this.person!,
            firstName: raw.firstName!,
            lastName:  raw.lastName!,
            email:     raw.email || undefined,
            phone:     raw.phone || undefined,
            place:     raw.place,
            address, // null => supprime l’adresse si orphanRemoval côté JPA, sinon backend ignore/traite
        });

        const flow$ = this.user
            ? p$.pipe(
                switchMap(() => this.userService.update({
                    ...this.user!,
                    role: raw.role,
                    enabled: !!raw.enabled,
                }))
            )
            : p$;

        flow$.subscribe({
            next: () => this.closed.emit(true),
            error: () => this.closed.emit(false),
        });
    }
}

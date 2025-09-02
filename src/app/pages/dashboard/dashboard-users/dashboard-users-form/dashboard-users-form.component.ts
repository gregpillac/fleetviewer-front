import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { of, switchMap } from 'rxjs';
import {MatFormField, MatInput, MatInputModule, MatLabel} from '@angular/material/input';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatDivider} from '@angular/material/divider';
import {NgForOf, NgIf} from '@angular/common';
import {User} from '../../../../models/user.model';
import {Person} from '../../../../models/person.model';
import {Role} from '../../../../models/role.model';
import {Address} from '../../../../models/address.model';
import {Place} from '../../../../models/place.model';
import {PersonService} from '../../../../services/person/person.service';
import {UserService} from '../../../../services/user/user.service';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonToggle} from '@angular/material/button-toggle';

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
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            // Person
            firstName: ['', Validators.required],
            lastName:  ['', Validators.required],
            email:     [''],
            phone:     [''],
            place:     [null as Place | null],
            address1:  [''],
            address2:  [''],
            city:      [''],
            postalCode:   [''],


            // User (optionnel en create)
            createAccount: [false],
            username: [''],
            role:     [null as Role | null],
            enabled:  [true],
            password: [''],
        });

        // Préremplir en édition
        if (this.mode === 'edit' && this.person) {
            this.form.patchValue({
                firstName:  this.person.firstName,
                lastName:   this.person.lastName,
                email:      this.person.email ?? '',
                phone:      this.person.phone ?? '',
                place:      this.person.place ?? null,
                line1:   this.person.address?.addressFirstLine ?? null,
                line2:   this.person.address?.addressSecondLine ?? null,
                city:       this.person.address?.city ?? null,
                postalCode: this.person.address?.postalCode ?? null,
            });

            // Si l’utilisateur a un compte, préremplir la partie compte
            if (this.user) {
                this.form.patchValue({
                    createAccount: true,            // on affiche la section
                    username: this.user.username,
                    role:   this.user.role ?? '',
                    enabled:  this.user.enabled,
                });
                // (optionnel) éviter d’éditer le username ici :
                this.form.get('username')?.disable();
            }
        }

        // Validations dynamiques pour la section compte
        this.form.get('createAccount')!.valueChanges.subscribe((checked: boolean) => {
            const setReq = (name: string, req: boolean) => {
                const c = this.form.get(name);
                if (!c) return; // évite le crash si le contrôle n’existe pas
                c.setValidators(req ? [Validators.required] : []);
                c.updateValueAndValidity({ emitEvent: false });
            };
            setReq('username', checked);
            setReq('role',     checked);
            setReq('password', checked && this.mode === 'create');
        });
    }

    cancel() { this.closed.emit(false); }

    submit() {
        if (this.form.invalid) return;
        const rawValue = this.form.getRawValue();

        if (this.mode === 'create') {
            // 1) Créer la Person
            this.personService.create({
                firstName: rawValue.firstName!,
                lastName: rawValue.lastName!,
                email: rawValue.email ?? undefined,
                phone: rawValue.phone ?? undefined,
                place: rawValue.place,
                address: {
                    addressFirstLine: rawValue.line1,
                    addressSecondLine: rawValue.line2,
                    city: rawValue.city,
                    postalCode: rawValue.postalCode,
                }
            }).pipe(
                // 2) Si demandé, créer le compte lié
                switchMap(createdPerson => {
                    if (!rawValue.createAccount) return of(true);
                    const dto = {
                        username: rawValue.username!,
                        password: rawValue.password!,        // requis en create
                        enabled:  !!rawValue.enabled,
                        role:     rawValue.role,
                        person:   createdPerson
                    };
                    return this.userService.create(dto).pipe(switchMap(() => of(true)));
                })
            ).subscribe({
                next: () => this.closed.emit(true),
                error: () => this.closed.emit(false)
            });
            return;
        }

        // EDIT : 1) update Person, 2) si compte existe, update User (rôle/enabled)
        const p$ = this.personService.update({
            ...this.person!,
            firstName: rawValue.firstName!,
            lastName: rawValue.lastName!,
            email: rawValue.email ?? undefined,
            phone: rawValue.phone ?? undefined,
            place: rawValue.place,
            address: {
                addressFirstLine: rawValue.line1,
                addressSecondLine: rawValue.line2,
                city: rawValue.city,
                postalCode: rawValue.postalCode,
            }
        });

        const flow$ = this.user
            ? p$.pipe(switchMap(() => this.userService.update({
                ...this.user!,
                role: rawValue.role,
                enabled: !!rawValue.enabled
            })))
            : p$;

        flow$.subscribe({
            next: () => this.closed.emit(true),
            error: () => this.closed.emit(false)
        });
    }
}

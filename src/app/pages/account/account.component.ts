import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

import { User } from '../../models/user.model';
import { Address } from '../../models/address.model';

import { AccountSecurityModalComponent } from './account-security-modal/account-security-modal.component';

/* --- Validator "adresse entamée => champs core requis" --- */
function addressStartedValidator(group: AbstractControl): ValidationErrors | null {
    const g = group as FormGroup;
    const l1  = (g.get('addressFirstLine')?.value ?? '').trim();
    const l2  = (g.get('addressSecondLine')?.value ?? '').trim();
    const pc  = (g.get('postalCode')?.value ?? '').trim();
    const city= (g.get('city')?.value ?? '').trim();

    const started = !!(l1 || l2 || pc || city);
    const ok = !!(l1 && pc && city);
    return started && !ok ? { addressIncomplete: true } : null;
}

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AccountSecurityModalComponent],
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
    form!: FormGroup;

    loading = true;
    isEditing = false;
    isEditingPassword = false;

    // Modale de sécurité (username / password)
    showSecurityModal = false;
    securityMode: 'username' | 'password' = 'username';
    modalError: string | null = null;

    // Toast
    toastMessage: string | null = null;

    // Snapshot d’origine pour comparer le username
    private originalUser!: User;

    // Pour savoir si l’utilisateur a édité manuellement le username
    private usernameManuallyEdited = false;

    // Mot de passe saisi dans la modale pour autoriser le changement d’identifiant
    private pendingPasswordForUsername: string | null = null;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private auth: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.buildForm();

        // 1) Écouter l’utilisateur courant et patcher le formulaire de façon fiable
        this.auth.currentUser$
            .pipe(
                filter((u): u is User => !!u),
                distinctUntilChanged((a, b) => a.id === b.id)
            )
            .subscribe(user => {
                this.originalUser = structuredClone(user);
                this.patchFormFromUser(user);
                this.loading = false;
                this.cdr.markForCheck();
            });

        // 2) Détection d’édition manuelle de l’identifiant
        this.form.get('username')!.valueChanges.subscribe(() => {
            if (this.isEditing) this.usernameManuallyEdited = true;
        });

        // 3) Génération auto de l’identifiant si l’utilisateur n’a pas édité manuellement
        this.form.get('person.firstName')!.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => this.maybeGenerateUsername());
        this.form.get('person.lastName')!.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => this.maybeGenerateUsername());
    }

    /* ------------------ Form helpers ------------------ */

    private buildForm(): void {
        this.form = this.fb.group({
            username: ['', Validators.required],
            person: this.fb.group({
                firstName: ['', Validators.required],
                lastName:  ['', Validators.required],
                email:     [''],
                phone:     [''],
                address: this.fb.group({
                    id: [null],
                    addressFirstLine: [''],
                    addressSecondLine: [''],
                    postalCode: [''],
                    city: [''],
                }, { validators: [addressStartedValidator] })
            })
        });
    }

    private patchFormFromUser(u: User): void {
        this.form.patchValue({
            username: u.username ?? '',
            person: {
                firstName: u.person?.firstName ?? '',
                lastName:  u.person?.lastName ?? '',
                email:     u.person?.email ?? '',
                phone:     u.person?.phone ?? '',
                address: {
                    id: u.person?.address?.id ?? null,
                    addressFirstLine:  u.person?.address?.addressFirstLine ?? '',
                    addressSecondLine: u.person?.address?.addressSecondLine ?? '',
                    postalCode:        u.person?.address?.postalCode ?? '',
                    city:              u.person?.address?.city ?? '',
                }
            }
        }, { emitEvent: false });

        this.form.markAsPristine();
        this.usernameManuallyEdited = false;
    }

    get addressGroup(): FormGroup {
        return this.form.get('person.address') as FormGroup;
    }

    get addressError(): string | null {
        return this.isEditing && this.addressGroup.hasError('addressIncomplete')
            ? 'Complétez l’adresse : N° et rue, code postal et ville.'
            : null;
    }

    private maybeGenerateUsername(): void {
        if (!this.isEditing || this.usernameManuallyEdited) return;
        const fn = (this.form.get('person.firstName')?.value || '').trim();
        const ln = (this.form.get('person.lastName')?.value  || '').trim();
        if (!fn && !ln) return;

        this.userService.generateUsername(fn, ln).subscribe(name => {
            this.form.get('username')!.setValue(name, { emitEvent: false });
        });
    }

    /* ------------------ UI actions ------------------ */

    toggleEdit(): void {
        this.isEditing = true;
    }

    toggleEditPassword(): void {
        this.isEditingPassword = true;
        this.securityMode = 'password';
        this.modalError = null;
        this.showSecurityModal = true;
    }

    cancelEdit(): void {
        // Revenir à l’état serveur
        this.patchFormFromUser(this.originalUser);
        this.isEditing = false;
    }

    /* ------------------ Submit / Modale ------------------ */

    onSubmit(): void {
        if (!this.isEditing) return;

        // Si l’adresse est complètement vide → enverra null (voir construction payload)
        // Si l’adresse est entamée mais incomplète → on bloque via le validator
        if (this.addressGroup.invalid) {
            this.addressGroup.markAllAsTouched();
            return;
        }

        // Si le username a changé → demander le mot de passe avant l’update
        const currentUsername = this.originalUser?.username ?? '';
        const newUsername = this.form.get('username')!.value ?? '';
        if (newUsername && newUsername !== currentUsername) {
            this.securityMode = 'username';
            this.modalError = null;
            this.showSecurityModal = true;
            return;
        }

        // Sinon, update direct
        this.updateUser();
    }

    onSecurityConfirm(payload: any): void {
        if (this.securityMode === 'username') {
            // payload = mot de passe courant
            this.pendingPasswordForUsername = (payload as string) || null;
            this.updateUser();
        } else {
            // payload = { currentPwd, newPwd, confirmPwd }
            const { currentPwd, newPwd, confirmPwd } = payload as { currentPwd: string; newPwd: string; confirmPwd: string };
            if (!newPwd || newPwd !== confirmPwd) {
                this.modalError = 'Les nouveaux mots de passe ne correspondent pas.';
                return;
            }
            this.changePassword(currentPwd, newPwd);
        }
    }

    cancelModal(): void {
        this.showSecurityModal = false;
        this.isEditingPassword = false;
        this.modalError = null;
        this.cdr.markForCheck();
    }

    /* ------------------ API calls ------------------ */

    private updateUser(): void {
        // Construire le DTO attendu par /api/users/me
        const raw = this.form.getRawValue();

        // Adresse : si aucun champ n’est rempli → envoyer null
        const a = raw.person.address;
        const addressStarted = !!(
            (a?.addressFirstLine ?? '').trim() ||
            (a?.addressSecondLine ?? '').trim() ||
            (a?.postalCode ?? '').trim() ||
            (a?.city ?? '').trim()
        );
        const addressPayload: Address | null = addressStarted ? {
            id: a?.id ?? null,
            addressFirstLine: a?.addressFirstLine ?? '',
            addressSecondLine: a?.addressSecondLine || null,
            postalCode: a?.postalCode ?? '',
            city: a?.city ?? ''
        } : null;

        const payload: Partial<User> = {
            username: raw.username,
            // mot de passe seulement si on change l’identifiant (vérif côté serveur)
            ...(this.pendingPasswordForUsername ? { password: this.pendingPasswordForUsername } : {}),
            person: {
                ...this.originalUser.person,
                firstName: raw.person.firstName,
                lastName:  raw.person.lastName,
                email:     raw.person.email,
                phone:     raw.person.phone,
                address:   addressPayload
            }
        } as Partial<User>;

        this.userService.updateCurrentUser(payload as User).subscribe({
            next: (response: any) => {
                // Si username changé, le backend renvoie { user, token }
                const returnedUser: User = response.user ?? response;
                const token: string | undefined = response.token;

                if (token) {
                    sessionStorage.setItem('token', token);
                }

                // Rafraîchir l’utilisateur courant dans l’app
                this.userService.getCurrentUser().subscribe(u => this.auth.setCurrentUser(u));

                // Reset UI
                this.pendingPasswordForUsername = null;
                this.isEditing = false;
                this.showSecurityModal = false;
                this.toast('Le profil a bien été mis à jour.');
            },
            error: (err) => {
                if (this.securityMode === 'username') {
                    if (err?.status === 401 || err?.error?.message === 'Mot de passe incorrect') {
                        this.modalError = 'Mot de passe incorrect';
                        return;
                    }
                }
                this.modalError = 'Erreur inattendue lors de la modification.';
            }
        });
    }

    private changePassword(currentPwd: string, newPwd: string): void {
        this.userService.changeCurrentUserPassword(currentPwd, newPwd).subscribe({
            next: () => {
                // facultatif : rafraîchir le current user
                this.userService.getCurrentUser().subscribe(u => this.auth.setCurrentUser(u));
                this.isEditingPassword = false;
                this.showSecurityModal = false;
                this.toast('Le mot de passe a bien été mis à jour.');
                this.modalError = null;
            },
            error: (err) => {
                this.modalError = err?.error?.message || 'Erreur lors du changement de mot de passe.';
            }
        });
    }

    private toast(msg: string): void {
        this.toastMessage = msg;
        setTimeout(() => (this.toastMessage = null), 3000);
    }
}

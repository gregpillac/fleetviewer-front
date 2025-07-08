import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {User} from '../../models/user.model';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {AccountSecurityModalComponent} from './account-security-modal/account-security-modal.component';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-account',
    imports: [
        NgIf,
        FormsModule,
        AccountSecurityModalComponent
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
    user!: User;
    originalUser!: User;
    isEditing = false;
    isEditingPassword = false;
    showSecurityModal = false;
    modalError: string | null = null;
    toastMessage: string | null = null;
    securityMode: 'username' | 'password' = 'username';

    constructor(
        private router: Router,
        private userService: UserService,
        private authService: AuthService,
    ) {
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(u => {
            if (u) {
                this.user = structuredClone(u);
                this.originalUser = structuredClone(u); // Copie sauvegarde
            }
        });
    }

    toggleEdit(): void {
        this.isEditing = true;
    }

    toggleEditPassword(): void {
        this.isEditingPassword = true;
        this.securityMode = 'password';
        this.showSecurityModal = true;
    }

    cancelEdit(): void {
        this.user = structuredClone(this.originalUser);
        this.isEditing = false;
    }

    onSubmit(): void {
        if (this.user.username !== this.originalUser.username) {
            // Demande le mot de passe AVANT d’envoyer la mise à jour
            this.securityMode = 'username';
            this.showSecurityModal = true;
            this.modalError = null;
        } else {
            this.updateUser(); // appel direct sinon
        }
    }

    onSecurityConfirm(payload: any | { currentPwd: string; newPwd: string; confirmPwd: string }) {
        if (this.securityMode === 'username') {
            this.user.password = payload as string;
            this.updateUser();
        } else if (this.securityMode === 'password') {
            const { currentPwd, newPwd, confirmPwd } = payload as any;

            if (newPwd !== confirmPwd) {
                this.modalError = "Les nouveaux mots de passe ne correspondent pas.";
                return;
            }
            // Appelle la fonction de changement de mot de passe
            this.changePassword(currentPwd, newPwd);
        }
    }

    cancelModal() {
        this.showSecurityModal = false;
        this.isEditingPassword = false;
        this.modalError = null;
    }

    updateUser() {
        this.userService.updateCurrentUser(this.user).subscribe({
            next: response => {
                if (response.token) {
                    sessionStorage.setItem('token', response.token);
                    this.showSecurityModal = false; // on ferme la modal

                } else { // Cas où pas de token (username non changé)
                    this.originalUser = structuredClone(response);
                }
                this.userService.getCurrentUser().subscribe(user => {
                    this.authService.setCurrentUser(user);
                });
                this.isEditing = false;
                this.toastMessage = "Le profil a bien été mis à jour.";
                setTimeout(() => this.toastMessage = null, 3000);
            },
            error: (err) => {
                if (err.status === 401 || (err.error && err.error.message === "Mot de passe incorrect")) {
                    this.modalError = "Mot de passe incorrect";
                } else {
                    this.modalError = "Erreur inattendue lors de la modification.";
                }
            }
        });
    }

    changePassword(currentPwd: string, newPwd: string) {
        this.userService.changeCurrentUserPassword(currentPwd, newPwd).subscribe({
            next: () => {
                this.userService.getCurrentUser().subscribe(user => {
                    this.authService.setCurrentUser(user);
                });
                this.isEditingPassword = false;
                this.showSecurityModal = false;
                this.toastMessage = "Le mot de passe a bien été mis à jour.";
                setTimeout(() => this.toastMessage = null, 3000);
                this.modalError = null;
            },
            error: err => {
                if (err.error && err.error.message) {
                    this.modalError = err.error.message;
                } else {
                    this.modalError = "Erreur lors du changement de mot de passe.";
                }
            }
        });
    }

    onNameFieldsChange(): void {
        setTimeout(() => {
            this.userService.generateUsername(this.user.person.firstName, this.user.person.lastName).subscribe(
                (username) => {
                    this.user.username = username;
                }
            );
        });
    }

}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';


@Component({
    selector: 'app-account-security-modal',
    imports: [
    FormsModule,
    NgIf
    ],
    templateUrl: './account-security-modal.component.html',
    styleUrl: './account-security-modal.component.scss'
})
export class AccountSecurityModalComponent {
    @Input() show = false;
    @Input() mode: 'username' | 'password' = 'username'; // peut gérer les deux
    @Output() confirm = new EventEmitter<any>();
    @Output() cancel = new EventEmitter<void>();
    @Input() errorMessage: string | null = null;

    password: string = '';
    newPassword: string = '';
    newPasswordConfirm: string = '';
    showCurrentPassword = false;
    showNewPassword = false;
    showNewPasswordConfirm = false;

    toggleField(field: 'current' | 'new' | 'confirm') {
        if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
        if (field === 'new') this.showNewPassword = !this.showNewPassword;
        if (field === 'confirm') this.showNewPasswordConfirm = !this.showNewPasswordConfirm;
    }

    resetFields(): void {
        this.password = '';
        this.newPassword = '';
        this.newPasswordConfirm = '';
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showNewPasswordConfirm = false;
    }

    onConfirm(): void {
        if (this.mode === 'username') {
            if (!this.password.trim()) {
                this.errorMessage = "Veuillez saisir votre mot de passe.";
                return;
            }
            this.confirm.emit(this.password);
            this.password = '';
            this.errorMessage = null;
        } else if (this.mode === 'password') {
            // Vérifie que tous les champs sont remplis
            if (!this.password.trim() || !this.newPassword.trim() || !this.newPasswordConfirm.trim()) {
                this.errorMessage = "Veuillez remplir tous les champs.";
                return;
            }

            // Vérifie que nouveau mdp ≠ actuel
            if (this.password === this.newPassword) {
                this.errorMessage = "Le nouveau mot de passe doit être différent de l'actuel.";
                return;
            }

            // Vérifie confirmation
            if (this.newPassword !== this.newPasswordConfirm) {
            this.errorMessage = "La confirmation du mot de passe ne correspond pas.";
            return;
            }

            // Tout est ok
            this.confirm.emit({ currentPwd: this.password, newPwd: this.newPassword, confirmPwd: this.newPasswordConfirm });
            this.resetFields();
            this.errorMessage = null;
        }
    }


    onCancel(): void {
        this.resetFields();
        this.cancel.emit();
    }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {ContactService} from '../../services/contact/contact.service'; // ← SnackBar Angular Material

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
    contactForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private contactService: ContactService,
        private snackBar: MatSnackBar
    ) {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            subject: ['', Validators.required],
            message: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.contactForm.valid) {
            this.contactService.sendMessage(this.contactForm.value)
                .subscribe({
                    next: () => {
                        this.snackBar.open(
                            '✅ Votre message a bien été réceptionné. Nous vous répondrons rapidement !',
                            'Fermer',
                            { duration: 4000, panelClass: ['snackbar-success'] }
                        );
                        this.contactForm.reset();
                    },
                    error: (err) => {
                        console.error(err);
                        this.snackBar.open(
                            '❌ Erreur lors de l’envoi du message.',
                            'Fermer',
                            { duration: 4000, panelClass: ['snackbar-error'] }
                        );
                    }
                });
        } else {
            this.snackBar.open(
                '⚠️ Veuillez remplir tous les champs correctement.',
                'Fermer',
                { duration: 4000, panelClass: ['snackbar-warning'] }
            );
        }
    }
}

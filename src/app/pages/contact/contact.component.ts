import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ← Ajouter ça pour *ngIf

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule], // ← Ajout de CommonModule
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.http.post('http://localhost:8080/api/contact', this.contactForm.value)
        .subscribe({
          next: () => {
            alert('Votre message a bien été réceptionné. Nous vous répondrons rapidement !');
            this.contactForm.reset();
          },
          error: (err) => {
            console.error(err);
            alert('Erreur lors de l’envoi du message.');
          }
        });
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }
}


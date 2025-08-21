import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from "angular-svg-icon";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SvgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;     // Objet qui contient les champs du formulaire
  showPassword = false;     // Pour afficher ou masquer le mot de passe
  errorMessage = '';        // Message d'erreur global (sous le bouton)

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Création du formulaire avec validations "required"
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Si l'utilisateur est déjà connecté → redirection
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Si formulaire invalide (champs vides)
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir le nom d’utilisateur et le mot de passe';
      // Marque tous les champs comme "touchés" pour afficher les messages sous les inputs
      this.loginForm.markAllAsTouched();
      return;
    }

    // Sinon → réinitialise le message d'erreur et tente la connexion
    this.errorMessage = '';
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = 'Échec de connexion: ' + (err.error?.message || err.statusText);
      }
    });
  }
}


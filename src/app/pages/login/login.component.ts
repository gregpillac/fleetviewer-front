import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {CommonModule} from '@angular/common';
import {SvgIconComponent} from "angular-svg-icon";
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, SvgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
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
            switch (this.authService.getCurrentUser()?.role.id) {
                case 'ROLE_ADMIN':
                case 'ROLE_MANAGER':
                    this.router.navigate(['dashboard/']);
                    break;
                case 'ROLE_USER':
                case 'ROLE_DEFAULT':
                    this.router.navigate(['/']); // TODO: remplacer par /ride ou autre
                    break;
                default: this.router.navigate(['/login']);
            }
          },
        error: (err) => {
          this.errorMessage = 'Echec de connexion: ' + (err.error?.message || err.statusText);
        }
      });
    }
  }
}

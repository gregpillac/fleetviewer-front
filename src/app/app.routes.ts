import { Routes } from '@angular/router';
import {canActivateWithRole} from './guards/auth/auth.guard';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';

export const routes: Routes = [
  { title: 'FleetViewer - Accueil',path: '', component: HomeComponent, canActivate: [canActivateWithRole()] },
  { title: 'FleetViewer - Connexion',path: 'login', component: LoginComponent },
  { title: 'FleetViewer - Dashboard Supervision',path: 'dashboard', component: DashboardComponent, canActivate: [canActivateWithRole('ROLE_ADMIN')] },
  { title: 'Test',path: 'test', component: HomeComponent },
  { title: 'FleetViewer - Page introuvable', path: 'not-found', component: NotFoundComponent, canActivate: [canActivateWithRole()] },
  { path: '**', redirectTo: 'not-found' },
];

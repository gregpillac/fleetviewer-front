import { Routes } from '@angular/router';
import {canActivateWithRole} from './guards/auth/auth.guard';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {DashboardHubComponent} from './pages/dashboard/dashboard-hub/dashboard-hub.component';
import {DashboardUsersComponent} from './pages/dashboard/dashboard-users/dashboard-users.component';
import {DashboardVehiclesComponent} from './pages/dashboard/dashboard-vehicles/dashboard-vehicles.component';
import {AccountComponent} from './pages/account/account.component';
import {VehicleComponent} from './pages/vehicle/vehicle.component';

export const routes: Routes = [
  { title: 'FleetViewer - Accueil',path: '', component: HomeComponent, canActivate: [canActivateWithRole()] },
  { title: 'FleetViewer - Connexion',path: 'login', component: LoginComponent },
  { title: 'FleetViewer - Mon compte',path: 'account', component: AccountComponent, canActivate: [canActivateWithRole()] },
  { title: 'FleetViewer - Dashboard Supervision', path: 'dashboard', component: DashboardComponent, canActivate: [canActivateWithRole(['ROLE_ADMIN', 'ROLE_MANAGER'])],
    children: [
      { path: '', component: DashboardHubComponent }, // hub d'accueil
      { path: 'users', component: DashboardUsersComponent },
      { path: 'vehicles', component: DashboardVehiclesComponent },
      { path: 'vehicles/create', component: VehicleComponent },
      { path: 'vehicles/:id', component: VehicleComponent }
    ]
  },
  { title: 'Test',path: 'test', component: HomeComponent },
  { title: 'FleetViewer - Page introuvable', path: 'not-found', component: NotFoundComponent, canActivate: [canActivateWithRole()] },
  { path: '**', redirectTo: 'not-found' },
];

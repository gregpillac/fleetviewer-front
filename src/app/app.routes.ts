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
import {RideSearchComponent} from './pages/ride-search/ride-search.component';
import {DashboardUsersFormComponent} from './pages/dashboard/dashboard-users/dashboard-users-form/dashboard-users-form.component';

export const routes: Routes = [
    { title: 'FleetViewer - Accueil',path: '', component: HomeComponent, canActivate: [canActivateWithRole()] },
    { title: 'FleetViewer - Connexion',path: 'login', component: LoginComponent },
    { title: 'FleetViewer - Mon compte',path: 'account', component: AccountComponent, canActivate: [canActivateWithRole()] },
    { title: 'FleetViewer - Dashboard Supervision', path: 'dashboard', component: DashboardComponent, canActivate: [canActivateWithRole(['ROLE_ADMIN', 'ROLE_MANAGER'])],
        children: [
            { path: '', component: DashboardHubComponent }, // hub d'accueil pour les dashboard
            { title: ' | Utilisateurs', path: 'users', component: DashboardUsersComponent },
            { title: ' | Ajouter un utilisateur', path: 'users/new', component: DashboardUsersFormComponent },
            { title: ' | Modifier un utilisateur', path: 'users/:id', component: DashboardUsersFormComponent },
            { title: ' | Véhicules', path: 'vehicles', component: DashboardVehiclesComponent },
            { title: ' | Ajouter un véhicule', path: 'vehicles/create', component: VehicleComponent },
            { title: ' | Modifier un véhicule', path: 'vehicles/:id', component: VehicleComponent }
        ]
    },
    { title: 'FleetViewer - Demande de trajet',path: 'search-ride', component: RideSearchComponent},

    { title: 'FleetViewer - Page introuvable', path: 'not-found', component: NotFoundComponent, canActivate: [canActivateWithRole()] },
    { path: '**', redirectTo: 'not-found' },
];

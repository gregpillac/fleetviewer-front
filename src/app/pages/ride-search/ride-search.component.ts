import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← ajouté pour ngModel
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogComponent } from '../reservations/confirmation-dialog/confirmation-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker'; // Module du nouveau timepicker
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-ride-search',
  standalone: true,
  providers: [provideNativeDateAdapter()], // Ajout du provider pour le datepicker
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatDialogModule,
    ConfirmationDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule, // Ajout du module timepicker
    MatIconModule
  ],
  templateUrl: './ride-search.component.html',
  styleUrls: ['./ride-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RideSearchComponent implements OnInit {
  selectedTab: number = 0;

  // Modèles pour l'onglet "Trouver un véhicule"
  vehicleDepartureDateTime: Date = new Date();
  vehicleReturnDateTime: Date = new Date();

  // Modèles pour l'onglet "Covoiturage"
  carpoolDepartureDateTime: Date = new Date();
  carpoolReturnDateTime: Date = new Date();

  constructor(private dialog: MatDialog, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        const prefilledDate = new Date(params['date']);
        this.vehicleDepartureDateTime = prefilledDate;
        this.carpoolDepartureDateTime = prefilledDate;
      }
      if (params['type']) {
        this.selectedTab = params['type'] === 'vehicle' ? 0 : 1;
      }
    });
  }

  reserverVehicule() {
    console.log('Véhicule - Départ:', this.vehicleDepartureDateTime?.toISOString());
    console.log('Véhicule - Retour:', this.vehicleReturnDateTime?.toISOString());

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: 'Un trajet en covoiturage similaire existe. Voulez-vous continuer avec le véhicule ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("✅ Réservation de véhicule confirmée !");
      } else {
        console.log("🚗 Voir le covoiturage");
      }
    });
  }

  reserverCovoiturage() {
    console.log('Covoiturage - Départ:', this.carpoolDepartureDateTime?.toISOString());
    console.log('Covoiturage - Retour:', this.carpoolReturnDateTime?.toISOString());
    console.log("Réservation covoiturage sélectionnée");
  }
}

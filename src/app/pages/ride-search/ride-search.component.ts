import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogComponent } from '../reservations/confirmation-dialog/confirmation-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-ride-search',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    ConfirmationDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatIconModule
  ],
  templateUrl: './ride-search.component.html',
  styleUrls: ['./ride-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RideSearchComponent implements OnInit {

  departureDateTime: Date = new Date();
  returnDateTime: Date = new Date();

  constructor(private dialog: MatDialog, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.departureDateTime = new Date(params['date']);
      }
    });
  }

  onReserveVehicle() {
    this.checkAlternativeCarPool();

    console.log('Action: Réserver un véhicule');
    console.log('Départ:', this.departureDateTime?.toISOString());
    console.log('Retour:', this.returnDateTime?.toISOString());
  }

  onMakeReservationRequest() {
    this.checkAlternativeCarPool();

    console.log('Action: Faire une demande de réservation');
    console.log('Départ:', this.departureDateTime?.toISOString());
    console.log('Retour:', this.returnDateTime?.toISOString());
    // Logique pour la demande de réservation à implémenter
  }

  onSearchCarpool() {
    console.log('Action: Chercher un covoiturage');
    console.log('Départ:', this.departureDateTime?.toISOString());
    console.log('Retour:', this.returnDateTime?.toISOString());
    // Logique pour la recherche de covoiturage à implémenter
  }

  checkAlternativeCarPool() {
      // Logique pour la recherche de trajet correspondant à implémenter
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: {
              message: 'Un trajet en covoiturage similaire existe. Voulez-vous co-voiturer ?'
          }
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              console.log("✅ Action confirmée !");
              // Logique pour la recherche de trajet correspondant à implémenter
          } else {
              console.log("🚗 Redirect to autre action");
          }
      });
  }
}

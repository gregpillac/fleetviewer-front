import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../reservations/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-ride-search',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatDialogModule, ConfirmationDialogComponent],
  templateUrl: './ride-search.component.html',
  styleUrls: ['./ride-search.component.scss']
})
export class RideSearchComponent {
  constructor(private dialog: MatDialog) {}

  reserverVehicule() {
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
}

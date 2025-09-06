import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogComponent } from '../reservations/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-ride-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,            // ← ajouté ici
    MatTabsModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './ride-search.component.html',
  styleUrls: ['./ride-search.component.scss']
})
export class RideSearchComponent implements OnInit {
  selectedTab: number = 0;   // 0 = véhicule, 1 = covoiturage
  formDateDepart: string = '';
  formDateRetour: string = '';

  constructor(private dialog: MatDialog, private route: ActivatedRoute) {}

  ngOnInit() {
    // Récupération des query params pour pré-remplir la date et l'onglet
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.formDateDepart = params['date']; // date pré-remplie
      }
      if (params['type']) {
        this.selectedTab = params['type'] === 'vehicle' ? 0 : 1; // onglet sélectionné
      }
    });
  }

  // Réserver un véhicule avec popup de confirmation
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

  // Méthode pour réserver un covoiturage
  reserverCovoiturage() {
    console.log("Réservation covoiturage sélectionnée");
  }
}


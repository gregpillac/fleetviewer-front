import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {Status} from '../../enums/Status';

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
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './ride-search.component.html',
  styleUrls: ['./ride-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RideSearchComponent implements OnInit {

  reservationForm: FormGroup;
  statusValues = Object.values(Status);
  driverId: number = 0;

  departureDateTime: Date = new Date();
  returnDateTime: Date = new Date();

  constructor(
      private fb: FormBuilder,
      private dialog: MatDialog,
      private route: ActivatedRoute
  ) {
      this.reservationForm = this.fb.group({
          departureId: ['', Validators.required],
          arrivalId: ['', Validators.required],
          startDate: ['', Validators.required],
          endDate: ['', Validators.required],
          status: [Status.PENDING, Validators.required],
          vehicleId: [''],
          driverId: ['', Validators.required]
      })
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.departureDateTime = new Date(params['date']);
      }
    });
  }


  onSubmit() {

  }


    onDateChange(date: Date) {
        const current = this.reservationForm.get('startDate')?.value;
        if (date) {
            const updated = new Date(date);
            // si une heure existe déjà, on la conserve
            if (current) {
                updated.setHours(current.getHours(), current.getMinutes());
            }
            this.reservationForm.get('startDate')?.setValue(updated);
        }
    }

    onTimeChange(time: string) {
        const current = this.reservationForm.get('startDate')?.value || new Date();
        const [hours, minutes] = time.split(':').map(Number);
        current.setHours(hours, minutes, 0, 0);
        this.reservationForm.get('startDate')?.setValue(current);
    }


  onReserveVehicle() {
    this.checkAlternativeCarPool();
    console.log('Action: Réserver un véhicule');
  }


  onMakeReservationRequest() {
    this.checkAlternativeCarPool();
    console.log('Action: Faire une demande de réservation');
    // Logique pour la demande de réservation à implémenter
  }


  onSearchCarpool() {
    console.log('Action: Chercher un covoiturage');
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
          result ? console.log("✅ Action confirmée !") // Logique pour la recherche de trajet correspondant à implémenter
            : console.log("🚗 Redirect to autre action");
      });
  }
}

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
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-ride-search',
  standalone: true,
  providers: [provideNativeDateAdapter(),
      { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
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
      private route: ActivatedRoute,
      private dateAdapter: DateAdapter<Date>
  ) {
      this.dateAdapter.setLocale('fr-FR');
      this.reservationForm = this.fb.group({
          departureId: [null, Validators.required],
          arrivalId: [null, Validators.required],
          startDate: [new Date(), Validators.required],
          startTime: [new Date(), Validators.required],
          endDate: [new Date(), Validators.required],
          endTime: [new Date(), Validators.required],
          status: [Status.PENDING, Validators.required],
          vehicleId: [null],
          driverId: [null, Validators.required]
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
      const formValue = this.reservationForm.value;
      const startDateTime = this.combineDateAndTime(formValue.startDate, formValue.startTime);
      const endDateTime = this.combineDateAndTime(formValue.endDate, formValue.endTime);
      const payload = {
          ...formValue,
          startDateTime,
          endDateTime
      };
      console.log('Payload envoyé :', payload);
  }


  private combineDateAndTime(date: Date, time: any): Date | null {
      if (!date || !time) return null;
      const combined = new Date(date);
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return combined;
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

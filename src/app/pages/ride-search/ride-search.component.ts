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
import {ReservationService} from '../../services/reservation.service';
import {Reservation} from '../../models/reservation';

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
      private reservationService: ReservationService,
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
  }


  private combineDateAndTime(date: Date, time: any): Date | null {
      if (!date || !time) return null;
      const combined = new Date(date);
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return combined;
  }

    /**
     * Sérialiser un Date JS en LocalDateTime (texte) attendu par Spring:
     * Exemple: 2025-09-07T14:05:00   (PAS de Z, PAS d'offset)
     */
    private pad(n: number): string {
        return n < 10 ? `0${n}` : `${n}`;
    }

    private toLocalLdtString(d: Date): string {
        const y = d.getFullYear();
        const M = this.pad(d.getMonth() + 1);
        const D = this.pad(d.getDate());
        const h = this.pad(d.getHours());
        const m = this.pad(d.getMinutes());
        const s = this.pad(d.getSeconds());
        return `${y}-${M}-${D}T${h}:${m}:${s}`;
    }


  onReserveVehicle() {
    this.checkAlternativeCarPool();
    console.log('Action: Réserver un véhicule');
  }


  onMakeReservationRequest() {

      // this.checkAlternativeCarPool();
      const r = this.reservationForm.value;

      const start = this.combineDateAndTime(r.startDate, r.startTime);
      const end   = this.combineDateAndTime(r.endDate,   r.endTime);

      if (!start || !end) {
          console.error('Date/heure manquantes'); // TODO: afficher un message d'erreur dans l'UI
          return;
      }
      if (start > end) {
          console.error('La date/heure de début doit être ≤ fin');
          return;
      }

      // cast numériques si les inputs renvoient des strings
      const vehicleId: number | undefined =
          r.vehicleId !== null && r.vehicleId !== undefined && r.vehicleId !== ''
              ? Number(r.vehicleId)
              : undefined;

      const payload: Reservation = {
          departureId: Number(r.departureId),
          arrivalId: Number(r.arrivalId),
          startDate: this.toLocalLdtString(start),
          endDate:   this.toLocalLdtString(end),
          reservationStatus: (r.reservationStatus ?? 'PENDING') as Status,
          vehicleId,               // peut être null → Jackson le mappera en null
          driverId: Number(r.driverId)
      };

      this.reservationService.createReservation(payload).subscribe({
          next: (res) => { console.log('Réservation créée', res); // TODO: feedback UI / navigation
          },
          error: (err) => { console.error('Erreur création réservation', err); // TODO: afficher erreurs de validation renvoyées par le back
          }
      });
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

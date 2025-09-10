import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {ConfirmationDialogComponent} from '../home/confirmation-dialog/confirmation-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_LOCALE, MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatIconModule} from "@angular/material/icon";
import {Status} from '../../enums/Status';
import {ReservationService} from '../../services/reservation.service';
import {Reservation} from '../../models/reservation';
import {Place} from '../../models/place.model';
import {PlaceService} from '../../services/place/place.service';
import {MatSelect} from '@angular/material/select';
import {VehicleService} from '../../services/vehicle/vehicle.service';
import {Vehicle} from '../../models/vehicle';
import {AuthService} from '../../services/auth/auth.service';
import {PersonService} from '../../services/person/person.service';
import {Person} from '../../models/person.model';
import {filter, switchMap, take} from 'rxjs/operators';
import {User} from '../../models/user.model';

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
        ReactiveFormsModule,
        MatOption,
        MatSelect
    ],
  templateUrl: './ride-search.component.html',
  styleUrls: ['./ride-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RideSearchComponent implements OnInit {

  reservationForm: FormGroup;
  places: Place[] = [];
  vehicles: Vehicle[] = [];
  persons: Person[] = [];

  driverId: number = 0;


  constructor(
      private fb: FormBuilder,
      private auth: AuthService,
      private reservationService: ReservationService,
      private placeService: PlaceService,
      private vehicleService: VehicleService,
      private personService: PersonService,
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
          driverId: [1, Validators.required]
      })
  }

  get isAdmin(): boolean {return this.auth.isAdmin()};
  get isManager(): boolean {return this.auth.isManager()};
  get isUser(): boolean {return this.auth.isUser()};


  ngOnInit() {
      // Pré-remplir le CONDUCTEUR avec l'utilisateur courant
      this.auth.currentUser$
          .pipe( filter((u): u is User => !!u),
              take(1))
          .subscribe(user => {
              this.reservationForm.patchValue({ driverId: user.person.id });
          });

      // Charger la liste des CONDUCTEURS potentiels (Persons)
      if (this.isAdmin || this.isManager) {
          this.personService.getPersons().subscribe({
              next: persons => this.persons = persons,
              error: err => console.error('Chargement des personnes refusé (403)', err)
          });
      }

      // Si ADMIN, charger tous les UTILISATEURS, sinon, charger les UTILISATEURS du lieu de l'utilisateur connecté
      this.auth.currentUser$.pipe( filter((u): u is User => !!u),
          take(1),
          switchMap(user => this.isAdmin
              ? this.personService.getPersons()
              : this.personService.getPersonsByPlaceId(user!.person.place!.id)
          )
      ).subscribe(p => this.persons = p);

      // Si ADMIN, charger tous les VEHICULES, sinon, charger les véhicules du lieu de l'utilisateur connecté
      this.auth.currentUser$.pipe( filter((u): u is User => !!u),
          take(1),
          switchMap(user => this.isAdmin
              ? this.vehicleService.getVehicles()
              : this.vehicleService.getVehiclesByPlaceId(user!.person.place!.id)
          )
      ).subscribe(v => this.vehicles = v);

      this.placeService.getPlaces().subscribe(places => this.places = places);
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


  // Action ADMIN ou MANAGER permettant de reserver directement un vehicule
  onReserveVehicle() {
    //this.checkAlternativeCarPool();
      const r = this.reservationForm.value;
      const start = this.combineDateAndTime(r.startDate, r.startTime);
      const end   = this.combineDateAndTime(r.endDate,   r.endTime);

      if (!start || !end) {
          console.error('La date/heure de début doit être ≤ fin');
          return
      }
      if (start > end) {
          console.error('La date/heure de début doit être ≤ fin');
          return
      }
      const payload: Reservation =  {
          departureId: Number(r.departureId),
          arrivalId: Number(r.arrivalId),
          startDate: this.toLocalLdtString(start),
          endDate:   this.toLocalLdtString(end),
          reservationStatus: Status.CONFIRMED,
          vehicleId: Number(r.vehicleId),               // peut être null → Jackson le mappera en null
          driverId: Number(r.driverId)
      } as Reservation;

      this.reservationService.createReservation(payload).subscribe({
          next: (res) => { console.log('Réservation créée', res); // TODO: feedback UI / navigation
          },
          error: (err) => { console.error('Erreur création réservation', err); // TODO: afficher erreurs de validation renvoyées par le back
          }
      });
  }

  // Action USER permettant de demander l'attribution d un vehicule
  onMakeReservationRequest() {
      //this.checkAlternativeCarPool();
      const r = this.reservationForm.value;
      const start = this.combineDateAndTime(r.startDate, r.startTime);
      const end   = this.combineDateAndTime(r.endDate,   r.endTime);

      if (!start || !end) {
          console.error('La date/heure de début doit être ≤ fin');
          return
      }
      if (start > end) {
          console.error('La date/heure de début doit être ≤ fin');
          return
      }
      const payload: Reservation =  {
          departureId: Number(r.departureId),
          arrivalId: Number(r.arrivalId),
          startDate: this.toLocalLdtString(start),
          endDate:   this.toLocalLdtString(end),
          reservationStatus: Status.PENDING,
          driverId: Number(r.driverId)
      } as Reservation;

      // check si il y des trajets confirmés et compatibles (meme depart/arrivee/jour)
      this.reservationService.getCompatibleReservations(payload).subscribe(compatibleReservations => {
          if (compatibleReservations.length > 0) {
              // si oui, proposer de co-voiturer (dialog)
              // TODO: affichage dialog avec possibilité de co-voiturer
              this.checkAlternativeCarPool();
              console.log('Il y a des trajets compatibles', compatibleReservations);
          } else {
              // si non, creer la demande de réservation (status=PENDING)
              this.reservationService.createReservation(payload).subscribe({
                  next: (res) => { console.log('Réservation créée', res); // TODO: feedback UI / navigation
                  },
                  error: (err) => { console.error('Erreur création réservation', err); // TODO: afficher erreurs de validation renvoyées par le back
                  }
              });
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

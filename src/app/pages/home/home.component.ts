import { Component, Inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FullCalendarModule, MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  // Réservations existantes
  reservations: EventInput[] = [
    { title: 'Trajet Niort - Paris (Covoiturage)', date: '2025-06-02', color: '#2196F3' },
    { title: 'Réservation véhicule - Mission Lyon', date: '2025-06-04', color: '#FFA500' }
  ];

  // Options du calendrier
  calendarOptions: CalendarOptions;

  constructor(private router: Router, private dialog: MatDialog) {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      events: this.reservations,
      locales: [frLocale],
      locale: 'fr',
      dateClick: this.handleDateClick.bind(this),

      // Changement de couleur au survol
      dayCellDidMount: (info) => {
        info.el.addEventListener('mouseenter', () => {
          info.el.style.backgroundColor = 'rgba(0, 150, 136, 0.1)'; // léger vert
          info.el.style.borderRadius = '4px';
        });
        info.el.addEventListener('mouseleave', () => {
          info.el.style.backgroundColor = ''; // revient à l'état normal
        });
      }
    };
  }

  // Gestion du clic sur une date
  handleDateClick(arg: DateClickArg) {
    const clickedDate = arg.dateStr;
    const dayReservations = this.reservations.filter(r => r.date === clickedDate);

    if(dayReservations.length === 0) {
      const dialogRef = this.dialog.open(DateReservationDialog, {
        width: '400px',
        data: { date: clickedDate }
      });

      dialogRef.afterClosed().subscribe(result => {
        // Conversion en format ISO pour <input type="datetime-local">
        const isoDate = new Date(clickedDate).toISOString().slice(0,16); // YYYY-MM-DDTHH:MM

        if(result === 'vehicle') {
          this.router.navigate(['/search-ride'], { queryParams: { type: 'vehicle', date: isoDate }});
        } else if(result === 'covoiturage') {
          this.router.navigate(['/search-ride'], { queryParams: { type: 'covoiturage', date: isoDate }});
        }
      });

    } else {
      console.log('Réservations pour le jour:', dayReservations);
    }
  }
}

// Popup pour les jours sans réservation
@Component({
  selector: 'date-reservation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Pas de réservation</h2>
    <mat-dialog-content>
      <p>Vous n'avez aucune réservation pour le {{ data.date }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="reserveVehicle()">Trouver un véhicule</button>
      <button mat-button (click)="reserveCovoiturage()">Réserver un covoiturage</button>
    </mat-dialog-actions>
  `
})
export class DateReservationDialog {
  constructor(
    public dialogRef: MatDialogRef<DateReservationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  reserveVehicle() { this.dialogRef.close('vehicle'); }
  reserveCovoiturage() { this.dialogRef.close('covoiturage'); }
}

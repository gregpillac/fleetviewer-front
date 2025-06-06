import { Component } from '@angular/core';
import {FullCalendarModule} from '@fullcalendar/angular';
import {CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';


@Component({
  selector: 'app-home',
  imports: [
    FullCalendarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [
      { title: 'Trajet Niort - Paris', date: new Date("2025-06-02").toISOString().slice(0, 10) },
      { title: 'Réservation véhicule - Mission Lyon', start: '2025-06-04',end: '2025-06-06', allDay: true, color: '#FFA500' }
    ],
    locales: [frLocale],
    locale: 'fr',
  };

}

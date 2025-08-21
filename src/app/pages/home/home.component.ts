import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; // Module Angular pour utiliser FullCalendar
import { CalendarOptions } from '@fullcalendar/core'; // Interface pour typer les options du calendrier
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin pour l'affichage en grille mensuelle
import frLocale from '@fullcalendar/core/locales/fr'; // Traduction française

@Component({
  selector: 'app-home', // Nom de la balise HTML pour ce composant
  imports: [
    FullCalendarModule // Import du module pour que le template puisse utiliser <full-calendar>
  ],
  templateUrl: './home.component.html', // Fichier HTML associé
  styleUrl: './home.component.scss'     // Fichier de styles associé
})
export class HomeComponent {
  
  // Objet de configuration du calendrier
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth', // Vue par défaut : grille mensuelle
    plugins: [dayGridPlugin],    // Plugins activés (ici juste l'affichage mensuel)
    
    // Liste des événements affichés dans le calendrier
    events: [
      {
        title: 'Trajet Niort - Paris', 
        date: new Date("2025-06-02").toISOString().slice(0, 10) // Conversion en format YYYY-MM-DD
      },
      {
        title: 'Réservation véhicule - Mission Lyon',
        start: '2025-06-04',  // Date de début
        end: '2025-06-06',    // Date de fin
        allDay: true,         // Événement sur toute la journée
        color: '#FFA500'      // Couleur personnalisée (orange)
      }
    ],

    locales: [frLocale], // Ajout de la locale française
    locale: 'fr',        // Utilisation du français par défaut
  };

}


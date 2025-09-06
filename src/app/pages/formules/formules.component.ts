import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tarif {
  range: string;
  price: string;
}

interface Formule {
  name: string;
  color: string;
  tarifs: Tarif[];
  inclus: string[];
  conditions: string[];
  options: string[];
}

@Component({
  selector: 'app-formules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formules.component.html',
  styleUrls: ['./formules.component.scss']
})
export class FormulesComponent {
  formules: Formule[] = [
    {
      name: 'Formule Bronze',
      color: '#cd7f32',
      tarifs: [
        { range: '0 à 20 véhicules', price: '5€/véhicule' },
        { range: '21 à 99 véhicules', price: '4,50€/véhicule' },
        { range: '100 à 500 véhicules', price: '4€/véhicule' },
        { range: '500+ véhicules', price: 'Sur mesure' },
      ],
      inclus: [
        'Mises à jour prises en charge',
        'Revalorisation des prix incluse',
        'Intégrateur inclus',
      ],
      conditions: [
        'Temps de réponse : > 1 semaine',
        'Temps de résolution : > 1 semaine',
      ],
      options: [
        'Installation & prise en main : +500€',
        'Licence On-Premise (2 ans) : +5000€',
      ],
    },
    {
      name: 'Formule Silver',
      color: '#c0c0c0',
      tarifs: [
        { range: '0 à 20 véhicules', price: '7€/mois' },
        { range: '21 à 99 véhicules', price: '6,5€/mois' },
        { range: '100 à 500 véhicules', price: '6€/mois' },
        { range: '500+ véhicules', price: 'Sur mesure' },
      ],
      inclus: [
        'Mises à jour prises en charge',
        'Revalorisation des prix incluse',
        'Intégrateur inclus',
      ],
      conditions: [
        'Temps de réponse : < 7 jours',
        'Temps de résolution : < 72 Heures',
      ],
      options: [
        'Installation & prise en main : +500€',
        'Licence On-Premise (2 ans) : +5000€',
      ],
    },
    {
      name: 'Formule Gold',
      color: '#ffd700',
      tarifs: [
        { range: '0 à 20 véhicules', price: '9€/mois' },
        { range: '21 à 99 véhicules', price: '8,5€/mois' },
        { range: '100 à 500 véhicules', price: '8€/mois' },
        { range: '500+ véhicules', price: 'Sur mesure' },
      ],
      inclus: [
        'Mises à jour prises en charge',
        'Revalorisation des prix incluse',
        'Intégrateur inclus',
      ],
      conditions: [
        'Temps de réponse : < 72 heures',
        'Temps de résolution : < 48 heures',
      ],
      options: [
        'Installation & prise en main : +500€',
        'Licence On-Premise (2 ans) : +5000€',
      ],
    },
    {
      name: 'Formule Platinium',
      color: '#e5e4e2',
      tarifs: [
        { range: '0 à 20 véhicules', price: '11€/mois' },
        { range: '21 à 99 véhicules', price: '10€/mois' },
        { range: '100 à 500 véhicules', price: '9€/mois' },
        { range: '500+ véhicules', price: 'Sur mesure' },
      ],
      inclus: [
        'Mises à jour prises en charge',
        'Revalorisation des prix incluse',
        'Intégrateur inclus',
      ],
      conditions: [
        'Temps de réponse : < 24 heures',
        'Temps de résolution : < 24 heures',
      ],
      options: [
        'Installation & prise en main : +500€',
        'Licence On-Premise (2 ans) : +5000€',
      ],
    },
  ];
}



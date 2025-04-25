import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SvgIconComponent} from 'angular-svg-icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SvgIconComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fleetviewer-front';
}

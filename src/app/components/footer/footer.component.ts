import { Component } from '@angular/core';
import {SvgIconComponent} from 'angular-svg-icon';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}

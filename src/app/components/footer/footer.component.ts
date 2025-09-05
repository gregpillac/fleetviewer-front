import { Component } from '@angular/core';
import {SvgIconComponent} from 'angular-svg-icon';
import {CommonModule} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
    imports: [CommonModule, SvgIconComponent, MatIcon, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}

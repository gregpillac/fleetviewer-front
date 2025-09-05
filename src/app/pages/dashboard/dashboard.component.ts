import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatListItem, MatNavList} from '@angular/material/list';


@Component({
  selector: 'app-dashboard',
    imports: [
        RouterOutlet,
        MatExpansionModule,
    ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}


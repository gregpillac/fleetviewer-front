import {Component, OnInit} from '@angular/core';
import {Vehicle} from '../../../models/vehicle';
import {VehicleService} from '../../../services/vehicle.service';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-dashboard-vehicles',
  imports: [CommonModule, MatTableModule],
  templateUrl: './dashboard-vehicles.component.html',
  styleUrl: './dashboard-vehicles.component.scss'
})

export class DashboardVehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  displayedColumns: string[] = ['place', 'brandModel', 'licensePlate', 'SeatNumber', 'MileAge'];


  constructor(private vehicleService: VehicleService) {}

  ngOnInit() {
    this.vehicleService.getVehicles().subscribe(v => {
      console.log('Véhicules reçus par le composant :', v);
      this.vehicles = v;
    });
  }
}

import {Component, OnInit} from '@angular/core';
import {Vehicle} from '../../../models/vehicle';
import {VehicleService} from '../../../services/vehicleService/vehicle.service';
import {PlaceService} from '../../../services/placeService/place.service';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {forkJoin} from 'rxjs';
import {Place} from '../../../models/place.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard-vehicles',
  imports: [CommonModule, MatTableModule],
  templateUrl: './dashboard-vehicles.component.html',
  styleUrl: './dashboard-vehicles.component.scss'
})

export class DashboardVehiclesComponent implements OnInit {

  vehicles: Vehicle[] = [];
  places: Place[] = [];

  displayedColumns: string[] = ['place', 'brandModel', 'licensePlate', 'SeatNumber', 'MileAge'];


  constructor(
    private vehicleService: VehicleService,
    private placeService: PlaceService,
    private router: Router
  ) {}

  ngOnInit() {
    forkJoin({
      vehicles: this.vehicleService.getVehicles(),
      places: this.placeService.getPlaces()
    }).subscribe(({ vehicles, places }) => {
      this.places = places;
      // Associer chaque véhicule à son objet Place complet
      this.vehicles = vehicles.map(vehicle => ({
        ...vehicle,
        place: places.find(p => p.id === vehicle.placeId) // placeId doit exister dans le VehicleDTO
      }));
    });
  }

  onRowClick(vehicle: any) {
    this.router.navigate(['dashboard/vehicles', vehicle.id]);
  }

  goToCreateVehicle() {
    this.router.navigate(['dashboard/vehicles/create']);
  }
}

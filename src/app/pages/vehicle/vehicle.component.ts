import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Place} from '../../models/place.model';
import {ActivatedRoute, Router} from '@angular/router';
import {VehicleService} from '../../services/vehicleService/vehicle.service';
import {PlaceService} from '../../services/placeService/place.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-vehicule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})

export class VehicleComponent implements OnInit {

  vehicleForm: FormGroup;
  places: Place[] = [];
  isEditMode = false;
  vehicleId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private placeService: PlaceService
  ) {
    this.vehicleForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      licensePlate: ['', Validators.required],
      seats: [1, [Validators.required, Validators.min(1)]],
      isRoadworthy: [true, Validators.required],
      isInsuranceValid: [true, Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      placeId: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.placeService.getPlaces().subscribe(places => this.places = places);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.vehicleId = +id;
        this.vehicleService.getVehicleById(this.vehicleId).subscribe(vehicle => {
          this.vehicleForm.patchValue(vehicle);
        });
      }
    });
  }

  onSubmit() {
    if (this.vehicleForm.invalid) return;
    if (this.isEditMode && this.vehicleId) {
      // UPDATE DU VEHICULE
      this.vehicleService.updateVehicle(this.vehicleId, this.vehicleForm.value).subscribe(() => {
        this.router.navigate(['/dashboard/vehicles']);
      });
    } else {
      // CREATION D UN VEHICULE
      this.vehicleService.createVehicle(this.vehicleForm.value).subscribe(() => {
        this.router.navigate(['/dashboard/vehicles']);
      });
    }
  }

}

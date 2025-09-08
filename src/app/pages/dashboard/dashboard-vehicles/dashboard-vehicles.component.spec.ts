import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { DashboardVehiclesComponent } from './dashboard-vehicles.component';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import { VehicleKeyService } from '../../../services/vehicle-key/vehicle-key.service';
import { PlaceService } from '../../../services/place/place.service';

class RouterStub { navigate(_: any[]) {} }
class VehicleServiceStub { getVehicles() { return of([]); } deleteVehicle(_: any){ return of(null); } }
class VehicleKeyServiceStub { getKeys() { return of([]); } getKeyByVehicle(_: any){ return of([]); } }
class PlaceServiceStub { getPlaces() { return of([]); } }

describe('DashboardVehiclesComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardVehiclesComponent],
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: VehicleService, useClass: VehicleServiceStub },
                { provide: VehicleKeyService, useClass: VehicleKeyServiceStub },
                { provide: PlaceService, useClass: PlaceServiceStub },
            ],
        })
            .overrideComponent(DashboardVehiclesComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(DashboardVehiclesComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

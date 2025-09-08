import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardVehiclesFormComponent } from './dashboard-vehicles-form.component';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { PlaceService } from '../../../../services/place/place.service';
import { VehicleKeyService } from '../../../../services/vehicle-key/vehicle-key.service';

class RouterStub { navigate(_: any[]) {} }
class ActivatedRouteStub { paramMap = of({ get: (_: string) => null }); }

class PlaceServiceStub {
    getPlaces() { return of([]); }
}

class VehicleServiceStub {
    getVehicleById(_: number) {
        return of({
            id: 1, brand: 'A', model: 'B', licensePlate: 'XYZ',
            seats: 4, isRoadworthy: true, isInsuranceValid: true,
            mileage: 0, placeId: 1
        });
    }
    createVehicle(_: any) { return of({ id: 1 }); }
    updateVehicle(_: number, __: any) { return of(null); }
}

class VehicleKeyServiceStub {
    getKeyByVehicle(_: number) { return of([]); }
    create(_: any) { return of({}); }
    update(_: any) { return of({}); }
    delete(_: number) { return of({}); }
}

describe('DashboardVehiclesFormComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardVehiclesFormComponent],
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                { provide: VehicleService, useClass: VehicleServiceStub },
                { provide: PlaceService, useClass: PlaceServiceStub },
                { provide: VehicleKeyService, useClass: VehicleKeyServiceStub },
            ],
        })
            .overrideComponent(DashboardVehiclesFormComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(DashboardVehiclesFormComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

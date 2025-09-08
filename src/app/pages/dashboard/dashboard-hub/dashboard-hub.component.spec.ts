// dashboard-hub.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { DashboardHubComponent } from './dashboard-hub.component';
import { PersonService } from '../../../services/person/person.service';
import { VehicleService } from '../../../services/vehicle/vehicle.service';

class RouterStub { navigate(_: any[]) {} }
class PersonServiceStub { getPersons() { return of([]); } }
class VehicleServiceStub { getVehicles() { return of([]); } }

describe('DashboardHubComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardHubComponent], // <-- ici
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: PersonService, useClass: PersonServiceStub },
                { provide: VehicleService, useClass: VehicleServiceStub },
            ],
        })
            .overrideComponent(DashboardHubComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const f = TestBed.createComponent(DashboardHubComponent);
        expect(f.componentInstance).toBeTruthy();
    });
});

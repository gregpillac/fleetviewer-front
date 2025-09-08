import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
    let service: VehicleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(VehicleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

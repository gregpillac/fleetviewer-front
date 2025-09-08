import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VehicleKeyService } from './vehicle-key.service'

describe('VehicleKeyService', () => {
    let service: VehicleKeyService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(VehicleKeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

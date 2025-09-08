import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service'

describe('ReservationService', () => {
    let service: ReservationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(ReservationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

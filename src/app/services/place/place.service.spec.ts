import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlaceService } from './place.service';

describe('PlaceService', () => {
    let service: PlaceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(PlaceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

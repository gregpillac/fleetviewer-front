import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddressService } from './address.service';

describe('AddressService', () => {
    let service: AddressService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(AddressService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

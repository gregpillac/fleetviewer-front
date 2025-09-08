import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContactService } from './contact.service';

describe('ContactService', () => {
    let service: ContactService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(ContactService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

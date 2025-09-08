import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleService } from './role.service';

describe('RoleService', () => {
    let service: RoleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // garde-le si le service fait du HTTP
        });
        service = TestBed.inject(RoleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

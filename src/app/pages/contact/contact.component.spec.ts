import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ContactComponent } from './contact.component';
import { ContactService } from '../../services/contact/contact.service';
import { HttpClient } from '@angular/common/http';

class ContactServiceStub {
    sendMessage(_: any) { return of(null); }
}
class HttpClientStub {}

describe('ContactComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContactComponent],
            providers: [
                { provide: ContactService, useClass: ContactServiceStub },
                { provide: HttpClient, useClass: HttpClientStub },
            ],
        })
            .overrideComponent(ContactComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(ContactComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LegalComponent } from './legal.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';

class ActivatedRouteStub { paramMap = of({ get: (_: string) => 'cgu' }); }
class HttpClientStub { get(_: string, __: any) { return of('<p>ok</p>'); } }
class DomSanitizerStub { bypassSecurityTrustHtml(v: any) { return v; } }
class TitleStub { setTitle(_: string) {} }
class MetaStub { updateTag(_: any) {} }

describe('LegalComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LegalComponent], // <-- ici
            providers: [
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                { provide: HttpClient, useClass: HttpClientStub },
                { provide: DomSanitizer, useClass: DomSanitizerStub },
                { provide: Title, useClass: TitleStub },
                { provide: Meta, useClass: MetaStub },
            ],
        })
            .overrideComponent(LegalComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const f = TestBed.createComponent(LegalComponent);
        expect(f.componentInstance).toBeTruthy();
    });
});

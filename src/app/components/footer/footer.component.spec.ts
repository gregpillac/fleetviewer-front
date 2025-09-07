import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FooterComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FooterComponent,
                HttpClientTestingModule,            // ⬅️ requis par le registry service
                AngularSvgIconModule.forRoot(),     // ⬅️ fournit SvgIconRegistryService
            ],
            // En dernier recours pour ignorer des balises inconnues:
            // schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(FooterComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

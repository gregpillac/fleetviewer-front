import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FooterComponent],
        })
            .overrideComponent(FooterComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(FooterComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

import { TestBed } from '@angular/core/testing';
import { FormulesComponent } from './formules.component';

describe('FormulesComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormulesComponent],
        })
            .overrideComponent(FormulesComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(FormulesComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

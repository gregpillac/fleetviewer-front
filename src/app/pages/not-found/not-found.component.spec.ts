import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NotFoundComponent, RouterTestingModule],
        })
            .overrideComponent(NotFoundComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(NotFoundComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

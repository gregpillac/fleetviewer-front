import { TestBed } from '@angular/core/testing';
import { SideMenuComponent } from './side-menu.component';

describe('SideMenuComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SideMenuComponent],
        })
            .overrideComponent(SideMenuComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(SideMenuComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

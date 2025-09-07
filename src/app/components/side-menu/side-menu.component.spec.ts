import { TestBed } from '@angular/core/testing';
import { SideMenuComponent } from './side-menu.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SideMenuComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SideMenuComponent,
                RouterTestingModule.withRoutes([]), // ⬅️ fournit ActivatedRoute
            ],
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(SideMenuComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

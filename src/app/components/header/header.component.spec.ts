import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HeaderComponent,
                HttpClientTestingModule, // ⬅️ fournit HttpClient
            ],
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(HeaderComponent);
        const comp = fixture.componentInstance;
        expect(comp).toBeTruthy();
    });
});

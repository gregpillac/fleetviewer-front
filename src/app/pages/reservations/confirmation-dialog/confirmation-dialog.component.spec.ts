import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

class MatDialogRefStub {
    close(_: any) {}
}

describe('ConfirmationDialogComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefStub },
                { provide: MAT_DIALOG_DATA, useValue: { message: 'Êtes-vous sûr ?' } },
            ],
        })
            .overrideComponent(ConfirmationDialogComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(ConfirmationDialogComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

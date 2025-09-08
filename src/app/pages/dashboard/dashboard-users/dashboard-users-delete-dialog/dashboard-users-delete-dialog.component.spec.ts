// dashboard-users-delete-dialog.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardUsersDeleteDialogComponent } from './dashboard-users-delete-dialog.component';

class MatDialogRefStub {
    close(_: any) {}
}

describe('DashboardUsersDeleteDialogComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardUsersDeleteDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { person: { firstName: 'John', lastName: 'Doe' }, user: null } },
                { provide: MatDialogRef, useClass: MatDialogRefStub },
            ],
        })
            .overrideComponent(DashboardUsersDeleteDialogComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(DashboardUsersDeleteDialogComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

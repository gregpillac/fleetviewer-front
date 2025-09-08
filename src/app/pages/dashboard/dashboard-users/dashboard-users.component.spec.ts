import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { DashboardUsersComponent } from './dashboard-users.component';
import { PersonService } from '../../../services/person/person.service';
import { UserService } from '../../../services/user/user.service';

class RouterStub { navigate(_: any[]) {} }
class PersonServiceStub { getPersons() { return of([]); } delete(_: any){ return of(null); } }
class UserServiceStub {
    getUsers() { return of([]); }
    updateStatus(_: any, __: any) { return of(null); }
    delete(_: any) { return of(null); }
}
class MatDialogStub { open(_: any, __?: any) { return { afterClosed: () => of(undefined) }; } }

describe('DashboardUsersComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardUsersComponent],
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: PersonService, useClass: PersonServiceStub },
                { provide: UserService, useClass: UserServiceStub },
                { provide: MatDialog, useClass: MatDialogStub },
            ],
        })
            .overrideComponent(DashboardUsersComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(DashboardUsersComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

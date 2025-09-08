import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardUsersFormComponent } from './dashboard-users-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonService } from '../../../../services/person/person.service';
import { UserService } from '../../../../services/user/user.service';
import { RoleService } from '../../../../services/role/role.service';

class RouterStub { navigate(_: any[]) {} }
class ActivatedRouteStub { snapshot = { paramMap: { get: (_: string) => null } }; }
class PersonServiceStub {}
class UserServiceStub {}
class RoleServiceStub { getRoles() { return of([]); } }

describe('DashboardUsersFormComponent (minimal)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardUsersFormComponent],
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                { provide: PersonService, useClass: PersonServiceStub },
                { provide: UserService, useClass: UserServiceStub },
                { provide: RoleService, useClass: RoleServiceStub },
            ],
        })
            .overrideComponent(DashboardUsersFormComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(DashboardUsersFormComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });
});

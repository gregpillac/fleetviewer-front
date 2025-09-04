import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUsersFormComponent } from './dashboard-users-form.component';

describe('DashboardUsersFormComponent', () => {
  let component: DashboardUsersFormComponent;
  let fixture: ComponentFixture<DashboardUsersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUsersFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUsersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

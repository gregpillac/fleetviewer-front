import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUsersDeleteDialogComponent } from './dashboard-users-delete-dialog.component';

describe('DashboardUsersDeleteDialogComponent', () => {
  let component: DashboardUsersDeleteDialogComponent;
  let fixture: ComponentFixture<DashboardUsersDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUsersDeleteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUsersDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

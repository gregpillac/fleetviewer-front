import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardReservationsComponent } from './dashboard-reservations.component';

describe('DashboardReservationsComponent', () => {
  let component: DashboardReservationsComponent;
  let fixture: ComponentFixture<DashboardReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

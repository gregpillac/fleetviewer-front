import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVehiclesComponent } from './dashboard-vehicles.component';

describe('DashboardVehiclesComponent', () => {
  let component: DashboardVehiclesComponent;
  let fixture: ComponentFixture<DashboardVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVehiclesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

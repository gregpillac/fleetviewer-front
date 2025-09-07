import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVehiclesFormComponent } from './dashboard-vehicles-form.component';

describe('DashboardVehiclesFormComponent', () => {
  let component: DashboardVehiclesFormComponent;
  let fixture: ComponentFixture<DashboardVehiclesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVehiclesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVehiclesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

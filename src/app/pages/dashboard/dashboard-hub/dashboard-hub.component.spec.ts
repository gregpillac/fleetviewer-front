import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHubComponent } from './dashboard-hub.component';

describe('DashboardHubComponent', () => {
  let component: DashboardHubComponent;
  let fixture: ComponentFixture<DashboardHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideSearchComponent } from './ride-search.component';

describe('RideSearchComponent', () => {
  let component: RideSearchComponent;
  let fixture: ComponentFixture<RideSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

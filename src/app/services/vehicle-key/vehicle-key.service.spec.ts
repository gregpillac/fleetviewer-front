import { TestBed } from '@angular/core/testing';

import { VehicleKeyService } from './vehicle-key.service';

describe('VehicleKeyService', () => {
  let service: VehicleKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

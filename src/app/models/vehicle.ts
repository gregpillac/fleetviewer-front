import {Place} from './place.model';

export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  seats: number;
  mileage: number;
  isRoadworthy: boolean;
  isInsuranceValid: boolean;
  placeId: number;
  place?: Place;
}

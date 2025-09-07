import {Place} from './place.model';
import {User} from './user.model';

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
}

export type CreateVehicle = Omit<Vehicle, 'id'>;

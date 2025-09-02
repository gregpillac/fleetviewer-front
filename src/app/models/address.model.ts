import {Person} from './person.model';

export interface Address {
  id?: number;
  addressFirstLine: string;
  addressSecondLine?: string;
  postalCode: string;
  city: string;
  gpsCoords?: string;
}

export type CreateAddress = Omit<Address, 'id'>;

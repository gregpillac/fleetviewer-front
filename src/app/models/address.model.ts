import {Person} from './person.model';

export interface Address {
  id?: number;
  addressFirstLine: string;
  addressSecondLine?: string | null;
  postalCode: string;
  city: string;
  gpsCoords?: Map<string, any> | null;
}

export type CreateAddress = Omit<Address, 'id'>;

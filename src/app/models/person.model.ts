import { Address } from './address.model';
import { Place } from './place.model';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  place?: Place;
}

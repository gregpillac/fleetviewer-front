import { Address } from './address.model';
import { Place } from './place.model';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address | null;
    place?: Place;
}

export type CreatePerson = Omit<Person, 'id'>;

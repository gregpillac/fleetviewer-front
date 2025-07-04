import { PlaceType } from './place-type.model';
import { Person } from './person.model';
import { Address } from './address.model';

export interface Place {
  id: number;
  name: string;
  isPublic: boolean;
  placeType: PlaceType;
  createdBy?: Person;
  address: Address;
}

import {Person} from './person.model';

export interface User {
  id: number;
  username: string;
  enabled: boolean;
  role: string;
  person: Person;
}

import {Person} from './person.model';
import { Role } from './role.model';

export interface User {
  id: number;
  username: string;
  password?: string;
  enabled: boolean;
  role: Role;
  person: Person;
}

export type CreateUser = Omit<User, 'id'>;

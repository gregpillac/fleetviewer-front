import {Status} from '../enums/Status';

export interface Reservation {
  id?: number;
  departureId: number;
  arrivalId: number;
  startDate: string;
  endDate: string;
  reservationStatus: Status;
  vehicleId?: number;
  driverId: number;
}

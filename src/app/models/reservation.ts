import {Status} from '../enums/Status';

export interface Reservation {
  id: number;
  departureId: number;
  arrivalId: number;
  startDate: number;
  endDate: Date;
  reservationStatus: Status;
  vehicleId?: number;
  driverId: number;
}

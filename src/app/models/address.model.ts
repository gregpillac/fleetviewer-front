export interface Address {
  id: number;
  addressFirstLine: string;
  addressSecondLine?: string;
  postalCode: string;
  city: string;
  gpsCoords?: string;
}

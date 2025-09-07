export interface VehicleKey {
    id: number;
    tagLabel?: string | null;
    vehicleId: number;
    placeId: number;
}

export type CreateVehicleKey = Omit<VehicleKey, 'id'>;

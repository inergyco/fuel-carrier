/** Latest known GPS position for a car (served from Redis). */
export type CarLocation = {
  carId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
};

/** Map marker payload: latest location joined with car identity. */
export type CarLocationMarker = CarLocation & {
  name: string | null;
  licensePlate: string;
};

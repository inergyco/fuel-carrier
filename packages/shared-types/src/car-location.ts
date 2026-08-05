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

/** Socket.IO / Redis fan-out event names for live map updates. */
export const CarLocationSocketEvents = {
  LOCATION_UPDATED: 'location.updated',
  LOCATION_REMOVED: 'location.removed',
} as const;

export type CarLocationSocketEventName =
  (typeof CarLocationSocketEvents)[keyof typeof CarLocationSocketEvents];

/** Published to Redis and pushed to company WebSocket rooms. */
export type CarLocationRealtimeEvent =
  | {
      type: typeof CarLocationSocketEvents.LOCATION_UPDATED;
      companyId: string;
      marker: CarLocationMarker;
    }
  | {
      type: typeof CarLocationSocketEvents.LOCATION_REMOVED;
      companyId: string;
      carId: string;
    };

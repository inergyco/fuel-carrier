/** GPIO output action sent to a truck over MQTT (SDD §18). */
export const CarOutputActions = {
  ENABLE: 'enable',
  DISABLE: 'disable',
} as const;

export type CarOutputAction =
  (typeof CarOutputActions)[keyof typeof CarOutputActions];

export type CarOutputCommandRequest = {
  action: CarOutputAction;
};

/** Result after the truck replies on `telemetry/<uuid>/output-ack`. */
export type CarOutputCommandResult = {
  success: boolean;
  action: CarOutputAction;
  commandId: number;
  message: string;
  pins?: {
    gpio25: boolean;
    gpio26: boolean;
  };
  deviceTime?: string;
};

/** SDD §19 `setFuelConfig` command sent to a truck. */

export const CarFuelConfigActions = {
  SET: 'setFuelConfig',
} as const;

export type CarFuelConfigAction =
  (typeof CarFuelConfigActions)[keyof typeof CarFuelConfigActions];

/**
 * Field-error codes returned when saved pricing cannot be encoded as
 * `fuelConfig`. The panel localizes these.
 */
export const CarFuelConfigFieldErrors = {
  INCOMPLETE: 'incomplete',
  PRICE_RANGE: 'price-range',
  WAGE_RANGE: 'wage-range',
  THRESHOLD_RANGE: 'threshold-range',
  THRESHOLD_ORDER: 'threshold-order',
} as const;

export type CarFuelConfigFieldError =
  (typeof CarFuelConfigFieldErrors)[keyof typeof CarFuelConfigFieldErrors];

/** Wage and liter thresholds are integers in this range (SDD §7 / §19). */
export const CAR_FUEL_CONFIG_INT_MIN = 1;
export const CAR_FUEL_CONFIG_INT_MAX = 10_000;

/** `pricePerLiter` must be greater than 0 and at most this value. */
export const CAR_FUEL_CONFIG_PRICE_MAX = 1_000_000;

/**
 * Fourth `volumeThresholdLiters` entry. The pricing form only has three
 * breakpoints; firmware ignores this value and we send the SDD maximum so
 * the four-element contract stays valid.
 */
export const CAR_FUEL_CONFIG_IGNORED_VOLUME_THRESHOLD_LITERS =
  CAR_FUEL_CONFIG_INT_MAX;

export type CarFuelConfig = {
  pricePerLiter: number;
  wage: [number, number, number, number];
  volumeThresholdLiters: [number, number, number, number];
};

/** Result after the truck replies on `telemetry/<uuid>/fuel-config-ack`. */
export type CarFuelConfigCommandResult = {
  success: boolean;
  commandId: number;
  message: string;
  fuelConfig?: CarFuelConfig;
  deviceTime?: string;
};

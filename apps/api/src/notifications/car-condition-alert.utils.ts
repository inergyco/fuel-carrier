import {
  FLEET_TOTAL_CAPACITY_LITERS,
  getFuelLevel,
} from '@fuel-carrier/shared-types/car-fleet-stats';
import {
  RESISTANCE_ALERT_THRESHOLD_OHMS,
  RESISTANCE_PROBE_KEYS,
  ResistanceProbeKeys,
  isResistanceAboveAlertThreshold,
  isResistanceOpenLine,
  type ResistanceProbeKey,
  type TankResistanceReadings,
} from '@fuel-carrier/shared-types/car-telemetry';
import { truncate } from '../common/string.utils';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
} from '../config/notification.config';

/**
 * English sentences below are the stored canonical copy.
 * Panels and the company-app service worker localize these exact strings.
 */
const PROBE_LABELS: Record<ResistanceProbeKey, string> = {
  [ResistanceProbeKeys.TANK_TO_GROUND]: 'Tank to ground',
  [ResistanceProbeKeys.TANK_TO_NOZZLE]: 'Tank to nozzle',
  [ResistanceProbeKeys.GROUND_TO_VEHICLE]: 'Ground to vehicle',
};

const LOW_FUEL_PERCENT = 25;

export type HighResistanceProbe = {
  probe: ResistanceProbeKey;
  ohms: number;
};

export type ConditionAlertMessage = {
  title: string;
  body: string;
  pushTitle: string;
};

export function listHighResistanceProbes(
  resistance: TankResistanceReadings,
): HighResistanceProbe[] {
  const high: HighResistanceProbe[] = [];

  for (const probe of RESISTANCE_PROBE_KEYS) {
    const ohms = resistance[probe];
    if (isResistanceAboveAlertThreshold(ohms)) {
      high.push({ probe, ohms });
    }
  }

  return high;
}

/** True when remain fuel is in the fleet "low" band (under 25%). */
export function isLowFuel(remainFuel: number): boolean {
  return getFuelLevel(remainFuel) === 'low';
}

export function buildResistanceAlertMessage(input: {
  licensePlate: string;
  probes: HighResistanceProbe[];
}): ConditionAlertMessage {
  const title = truncate('High tank resistance', NOTIFICATION_TITLE_MAX_LENGTH);
  const pushTitle = truncate(
    `High tank resistance — ${input.licensePlate}`,
    NOTIFICATION_TITLE_MAX_LENGTH,
  );
  const lines = input.probes.map(formatResistanceAlertLine);

  return {
    title,
    pushTitle,
    body: truncate(lines.join('\n'), NOTIFICATION_BODY_MAX_LENGTH),
  };
}

export function buildLowFuelAlertMessage(input: {
  licensePlate: string;
  remainFuel: number;
}): ConditionAlertMessage {
  const percent = fuelPercent(input.remainFuel);
  const title = truncate('Low fuel', NOTIFICATION_TITLE_MAX_LENGTH);
  const pushTitle = truncate(
    `Low fuel — ${input.licensePlate}`,
    NOTIFICATION_TITLE_MAX_LENGTH,
  );
  const body = truncate(
    `Remaining fuel is ${percent}% (${formatNumber(input.remainFuel)} L), below ${LOW_FUEL_PERCENT}%.`,
    NOTIFICATION_BODY_MAX_LENGTH,
  );

  return { title, body, pushTitle };
}

function fuelPercent(remainFuel: number): number {
  const percent = (remainFuel / FLEET_TOTAL_CAPACITY_LITERS) * 100;
  return Math.round(Math.max(0, Math.min(100, percent)));
}

function formatResistanceAlertLine(entry: HighResistanceProbe): string {
  const probe = PROBE_LABELS[entry.probe];
  if (isResistanceOpenLine(entry.ohms)) {
    return `${probe}: Open line.`;
  }

  return `${probe} is ${formatNumber(entry.ohms)} Ω, above the ${RESISTANCE_ALERT_THRESHOLD_OHMS} Ω limit.`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

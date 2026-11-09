import {
  FLEET_TOTAL_CAPACITY_LITERS,
  RESISTANCE_OPEN_LINE_OHMS,
} from '@fuel-carrier/shared-types';
import { STALE_TELEMETRY_THRESHOLD_MS } from '../config/notification.config';
import {
  buildLowFuelAlertMessage,
  buildResistanceAlertMessage,
  isLowFuel,
  listHighResistanceProbes,
} from './car-condition-alert.utils';
import {
  buildStaleTelemetryAlertMessage,
  isStaleTelemetry,
} from './stale-telemetry-alert';

describe('car-condition-alert.utils', () => {
  it('lists only probes above the alert threshold', () => {
    expect(
      listHighResistanceProbes({
        tankToGround: 10,
        tankToNozzle: 10.1,
        groundToVehicle: 4,
      }),
    ).toEqual([{ probe: 'tankToNozzle', ohms: 10.1 }]);
  });

  it('treats fuel under 25% of fleet capacity as low', () => {
    const quarter = FLEET_TOTAL_CAPACITY_LITERS * 0.25;

    expect(isLowFuel(quarter)).toBe(false);
    expect(isLowFuel(quarter - 0.1)).toBe(true);
    expect(isLowFuel(0)).toBe(true);
  });

  it('writes the English sentences the panels localize', () => {
    expect(
      buildLowFuelAlertMessage({ licensePlate: '12-ب-345', remainFuel: 0 }),
    ).toEqual({
      title: 'Low fuel',
      pushTitle: 'Low fuel — 12-ب-345',
      body: 'Remaining fuel is 0% (0 L), below 25%.',
    });

    expect(
      buildResistanceAlertMessage({
        licensePlate: '12-ب-345',
        probes: [
          { probe: 'tankToGround', ohms: RESISTANCE_OPEN_LINE_OHMS },
          { probe: 'tankToNozzle', ohms: RESISTANCE_OPEN_LINE_OHMS / 100 },
          { probe: 'groundToVehicle', ohms: 655.3 },
        ],
      }).body,
    ).toBe(
      [
        'Tank to ground: Open line.',
        'Tank to nozzle: Open line.',
        'Ground to vehicle: Open line.',
      ].join('\n'),
    );

    expect(
      buildResistanceAlertMessage({
        licensePlate: '12-ب-345',
        probes: [
          { probe: 'tankToGround', ohms: 10.1 },
          { probe: 'groundToVehicle', ohms: 12 },
        ],
      }),
    ).toEqual({
      title: 'High tank resistance',
      pushTitle: 'High tank resistance — 12-ب-345',
      body: [
        'Tank to ground is 10.1 Ω, above the 10 Ω limit.',
        'Ground to vehicle is 12 Ω, above the 10 Ω limit.',
      ].join('\n'),
    });

    const ingestedAt = new Date('2026-11-02T12:45:00.000Z');
    const recordedAt = new Date(ingestedAt.getTime() - 45 * 60_000);

    expect(
      buildStaleTelemetryAlertMessage({
        licensePlate: '12-ب-345',
        recordedAt,
        ingestedAt,
      }),
    ).toEqual({
      title: 'Stale telemetry',
      pushTitle: 'Stale telemetry — 12-ب-345',
      body: 'The device sample is about 45 minutes old (limit 30 minutes).',
    });
  });

  it('flags device samples older than 30 minutes at ingest', () => {
    const ingestedAt = new Date('2026-11-02T12:00:00.000Z');

    expect(
      isStaleTelemetry({
        recordedAt: new Date(
          ingestedAt.getTime() - STALE_TELEMETRY_THRESHOLD_MS,
        ),
        ingestedAt,
      }),
    ).toBe(false);

    expect(
      isStaleTelemetry({
        recordedAt: new Date(
          ingestedAt.getTime() - STALE_TELEMETRY_THRESHOLD_MS - 1,
        ),
        ingestedAt,
      }),
    ).toBe(true);
  });
});

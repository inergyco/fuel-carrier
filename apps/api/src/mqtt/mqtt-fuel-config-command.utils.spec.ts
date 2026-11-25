import { CAR_FUEL_CONFIG_IGNORED_VOLUME_THRESHOLD_LITERS } from '@fuel-carrier/shared-types';
import type { CarPricing } from '@fuel-carrier/shared-types';
import {
  buildFuelConfigCommandPayload,
  isFuelConfigAckTopic,
  parseFuelConfigAckPayload,
  toCarFuelConfig,
} from './mqtt-fuel-config-command.utils';

const pricing: CarPricing = {
  petrolPricePerLiter: 5000,
  feeThresholdX: 10,
  feeThresholdY: 50,
  feeThresholdZ: 100,
  feeUpToX: 250,
  feeXToY: 350,
  feeYToZ: 350,
  feeAboveZ: 350,
};

describe('mqtt-fuel-config-command.utils', () => {
  it('sends the SDD maximum as the fourth liter threshold', () => {
    const mapped = toCarFuelConfig(pricing);
    expect(mapped).toEqual({
      fuelConfig: {
        pricePerLiter: 5000,
        wage: [250, 350, 350, 350],
        volumeThresholdLiters: [
          10,
          50,
          100,
          CAR_FUEL_CONFIG_IGNORED_VOLUME_THRESHOLD_LITERS,
        ],
      },
    });

    if (!('fuelConfig' in mapped)) {
      throw new Error('expected fuelConfig');
    }

    const payload = buildFuelConfigCommandPayload({
      identity: { companyCode: 'COMPANY_001', deviceId: 'TRUCK_12' },
      fuelConfig: mapped.fuelConfig,
      commandId: 1001,
    });

    expect(payload).toEqual({
      version: 1,
      company: { id: 'COMPANY_001' },
      device: { deviceId: 'TRUCK_12' },
      command: { commandId: 1001, action: 'setFuelConfig' },
      fuelConfig: mapped.fuelConfig,
    });
  });

  it('rejects command ids reserved for GPIO', () => {
    const mapped = toCarFuelConfig(pricing);
    if (!('fuelConfig' in mapped)) {
      throw new Error('expected fuelConfig');
    }

    expect(() =>
      buildFuelConfigCommandPayload({
        identity: { companyCode: 'COMPANY_001', deviceId: 'TRUCK_12' },
        fuelConfig: mapped.fuelConfig,
        commandId: 42,
      }),
    ).toThrow();
  });

  it('rejects pricing the truck cannot store', () => {
    expect(
      toCarFuelConfig({
        ...pricing,
        feeAboveZ: 50_000,
        petrolPricePerLiter: null,
      }),
    ).toEqual({
      fields: [{ field: 'petrolPricePerLiter', message: 'incomplete' }],
    });

    const outOfRange = toCarFuelConfig({
      ...pricing,
      feeUpToX: 10.5,
      feeThresholdZ: 10_001,
    });
    expect(outOfRange).toEqual({
      fields: [
        { field: 'feeUpToX', message: 'wage-range' },
        { field: 'feeThresholdZ', message: 'threshold-range' },
      ],
    });
  });

  it('parses a successful fuel-config-ack', () => {
    const carId = '04543c49-a0df-4816-abad-884b5928983e';
    const topic = `telemetry/${carId}/fuel-config-ack`;
    const ack = parseFuelConfigAckPayload(
      topic,
      JSON.stringify({
        version: 1,
        success: true,
        companyId: 'COMPANY_001',
        deviceId: 'TRUCK_12',
        commandId: 1001,
        action: 'setFuelConfig',
        fuelConfig: {
          pricePerLiter: 5000,
          wage: [250, 350, 350, 350],
          volumeThresholdLiters: [10, 50, 100, 10000],
        },
        message: 'programmed and verified',
        deviceTime: '2026-11-13T18:05:00+03:30',
      }),
    );

    expect(isFuelConfigAckTopic(topic)).toBe(true);
    expect(ack).toEqual({
      carId,
      success: true,
      commandId: 1001,
      message: 'programmed and verified',
      fuelConfig: {
        pricePerLiter: 5000,
        wage: [250, 350, 350, 350],
        volumeThresholdLiters: [10, 50, 100, 10000],
      },
      deviceTime: '2026-11-13T18:05:00+03:30',
    });
  });

  it('accepts a failure ack that omits fuelConfig', () => {
    const topic =
      'telemetry/04543c49-a0df-4816-abad-884b5928983e/fuel-config-ack';
    expect(
      parseFuelConfigAckPayload(
        topic,
        JSON.stringify({
          success: false,
          commandId: 1001,
          action: 'setFuelConfig',
          message: 'invalid range',
        }),
      ),
    ).toMatchObject({ success: false, message: 'invalid range' });
    expect(parseFuelConfigAckPayload(topic, '{')).toBeNull();
  });
});

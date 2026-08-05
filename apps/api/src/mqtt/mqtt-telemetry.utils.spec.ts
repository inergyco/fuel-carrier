import {
  parseTelemetryCarId,
  parseTelemetryPayload,
} from './mqtt-telemetry.utils';

describe('mqtt-telemetry.utils', () => {
  const carId = '20bb76d1-acb0-4ddf-bcfb-088f2223a07e';

  it('parses car id from telemetry topics', () => {
    expect(parseTelemetryCarId(`telemetry/${carId}/gps`)).toBe(carId);
    expect(parseTelemetryCarId(`telemetry/${carId}`)).toBe(carId);
    expect(parseTelemetryCarId('telemetry/not-a-uuid/gps')).toBeNull();
  });

  it('parses industrial SDD telemetry packets', () => {
    const sample = parseTelemetryPayload(
      `telemetry/${carId}/packet`,
      JSON.stringify({
        version: 1,
        company: { id: 'COMPANY_001' },
        device: { deviceId: 'TRUCK_12', firmwareVersion: '1.0.0' },
        transaction: {
          transactionId: 125,
          completed: true,
          deviceTime: '2026-06-05T13:45:12Z',
        },
        location: { lat: 35.72154, lon: 51.39485, speed: 12.5 },
        fuel: {
          pricePerLiter: 5000,
          fuelAmount: 14.76,
          remainFuel: 1140,
          wage: 250,
        },
        resistance: {
          tankToGround: 5.34,
          tankToNozzle: 4.25,
          groundToVehicle: 1.8,
        },
        status: { fuelMode: true, dispenseMode: false },
        meta: {
          source: 'NodeMCU',
          protocol: 'MQTT',
          schemaVersion: '1.0',
        },
      }),
    );

    expect(sample).toEqual({
      carId,
      latitude: 35.72154,
      longitude: 51.39485,
      recordedAt: new Date('2026-06-05T13:45:12Z'),
      speed: 12.5,
      remainFuel: 1140,
      fuelAmount: 14.76,
      resistance: {
        tankToGround: 5.34,
        tankToNozzle: 4.25,
        groundToVehicle: 1.8,
      },
    });
  });

  it('rejects invalid payloads', () => {
    expect(parseTelemetryPayload(`telemetry/${carId}/packet`, '{bad')).toBeNull();
    expect(
      parseTelemetryPayload(
        `telemetry/${carId}/packet`,
        JSON.stringify({ latitude: 35.7, longitude: 51.4 }),
      ),
    ).toBeNull();
    expect(
      parseTelemetryPayload(
        `telemetry/${carId}/packet`,
        JSON.stringify({
          location: { lat: 120, lon: 51.4 },
        }),
      ),
    ).toBeNull();
  });
});

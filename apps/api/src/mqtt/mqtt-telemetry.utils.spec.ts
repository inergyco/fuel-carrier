import {
  parseTelemetryCarId,
  parseTelemetryGpsPayload,
} from './mqtt-telemetry.utils';

describe('mqtt-telemetry.utils', () => {
  it('parses car id from telemetry topics', () => {
    const carId = '20bb76d1-acb0-4ddf-bcfb-088f2223a07e';
    expect(parseTelemetryCarId(`telemetry/${carId}/gps`)).toBe(carId);
    expect(parseTelemetryCarId(`telemetry/${carId}`)).toBe(carId);
    expect(parseTelemetryCarId('telemetry/not-a-uuid/gps')).toBeNull();
  });

  it('parses valid GPS JSON payloads', () => {
    const carId = '20bb76d1-acb0-4ddf-bcfb-088f2223a07e';
    const sample = parseTelemetryGpsPayload(
      `telemetry/${carId}/gps`,
      JSON.stringify({ latitude: 35.7, longitude: 51.4 }),
    );

    expect(sample).toEqual({
      carId,
      latitude: 35.7,
      longitude: 51.4,
      recordedAt: undefined,
    });
  });

  it('rejects invalid payloads', () => {
    const carId = '20bb76d1-acb0-4ddf-bcfb-088f2223a07e';
    expect(
      parseTelemetryGpsPayload(`telemetry/${carId}/gps`, '{bad'),
    ).toBeNull();
    expect(
      parseTelemetryGpsPayload(
        `telemetry/${carId}/gps`,
        JSON.stringify({ latitude: 120, longitude: 51.4 }),
      ),
    ).toBeNull();
  });
});

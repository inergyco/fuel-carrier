import {
  buildOutputCommandPayload,
  isOutputAckTopic,
  parseOutputAckCarId,
  parseOutputAckPayload,
  toMqttDeviceIdentity,
} from './mqtt-output-command.utils';

describe('mqtt-output-command.utils', () => {
  it('builds an enable command payload with device identity', () => {
    const payload = buildOutputCommandPayload({
      identity: { companyCode: 'COMPANY_001', deviceId: 'TRUCK_12' },
      action: 'enable',
      commandId: 42,
    });

    expect(payload).toEqual({
      version: 1,
      company: { id: 'COMPANY_001' },
      device: { deviceId: 'TRUCK_12' },
      command: { commandId: 42, action: 'enable' },
    });
  });

  it('parses a successful output-ack topic and payload', () => {
    const carId = '04543c49-a0df-4816-abad-884b5928983e';
    const topic = `telemetry/${carId}/output-ack`;
    const ack = parseOutputAckPayload(
      topic,
      JSON.stringify({
        version: 1,
        success: true,
        companyId: 'COMPANY_001',
        deviceId: 'TRUCK_12',
        commandId: 42,
        action: 'disable',
        pins: { gpio25: false, gpio26: false },
        message: 'outputs disabled',
        deviceTime: '2026-11-13T16:05:01+03:30',
      }),
    );

    expect(isOutputAckTopic(topic)).toBe(true);
    expect(parseOutputAckCarId(topic)).toBe(carId);
    expect(ack).toEqual({
      carId,
      success: true,
      action: 'disable',
      commandId: 42,
      message: 'outputs disabled',
      pins: { gpio25: false, gpio26: false },
      deviceTime: '2026-11-13T16:05:01+03:30',
    });
  });

  it('rejects invalid output-ack payloads', () => {
    const topic = 'telemetry/04543c49-a0df-4816-abad-884b5928983e/output-ack';
    expect(parseOutputAckPayload(topic, '{')).toBeNull();
    expect(
      parseOutputAckPayload(
        topic,
        JSON.stringify({ success: true, commandId: 1 }),
      ),
    ).toBeNull();
  });

  it('requires both firmware IDs for MQTT device identity', () => {
    expect(
      toMqttDeviceIdentity({
        firmwareCompanyId: 'COMPANY_001',
        firmwareDeviceId: 'TRUCK_12',
      }),
    ).toEqual({ companyCode: 'COMPANY_001', deviceId: 'TRUCK_12' });

    expect(
      toMqttDeviceIdentity({
        firmwareCompanyId: 'COMPANY_001',
        firmwareDeviceId: null,
      }),
    ).toBeNull();
  });
});

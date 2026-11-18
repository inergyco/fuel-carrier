import {
  parseOutputAckEvent,
  serializeOutputAckEvent,
} from './mqtt-output-ack.redis';

describe('mqtt-output-ack.redis', () => {
  it('round-trips an output-ack event', () => {
    const event = {
      carId: '04543c49-a0df-4816-abad-884b5928983e',
      success: true,
      action: 'disable' as const,
      commandId: 42,
      message: 'outputs disabled',
      pins: { gpio25: false, gpio26: false },
      deviceTime: '2026-11-13T16:05:01+03:30',
    };

    expect(parseOutputAckEvent(serializeOutputAckEvent(event))).toEqual(event);
  });

  it('rejects invalid payloads', () => {
    expect(parseOutputAckEvent(null)).toBeNull();
    expect(parseOutputAckEvent('{')).toBeNull();
    expect(parseOutputAckEvent(JSON.stringify({ commandId: 1 }))).toBeNull();
  });
});

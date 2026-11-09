import { buildMqttSharedSubscribeTopic } from './mqtt-secret.utils';

describe('buildMqttSharedSubscribeTopic', () => {
  it('wraps a plain telemetry filter in a share group', () => {
    expect(
      buildMqttSharedSubscribeTopic({
        shareGroup: 'fuel-carrier',
        topicFilter: 'telemetry/#',
      }),
    ).toBe('$share/fuel-carrier/telemetry/#');
  });

  it('does not nest an existing share prefix', () => {
    expect(
      buildMqttSharedSubscribeTopic({
        shareGroup: 'fuel-carrier',
        topicFilter: '$share/old-group/telemetry/#',
      }),
    ).toBe('$share/fuel-carrier/telemetry/#');
  });
});

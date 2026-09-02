import mqtt from 'mqtt';

export type MqttProbeOptions = {
  url: string;
  username: string;
  password: string;
  timeoutMs: number;
};

export function probeMqttBroker(options: MqttProbeOptions): Promise<void> {
  const { url, username, password, timeoutMs } = options;

  return new Promise((resolve, reject) => {
    let settled = false;

    const client = mqtt.connect(url, {
      username,
      password,
      reconnectPeriod: 0,
      connectTimeout: timeoutMs,
    });

    function settle(onSettled: () => void) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      onSettled();
    }

    function teardown(callback: () => void) {
      client.removeAllListeners();
      client.end(true, {}, callback);
    }

    const timeoutId = setTimeout(function rejectMqttProbeTimeout() {
      settle(function onMqttProbeTimeout() {
        teardown(function afterMqttProbeTimeout() {
          reject(new Error(`Timed out after ${timeoutMs}ms`));
        });
      });
    }, timeoutMs);

    client.once('connect', function onMqttProbeConnect() {
      settle(function onMqttProbeConnected() {
        teardown(function afterMqttProbeConnect() {
          resolve();
        });
      });
    });

    client.once('error', function onMqttProbeError(error: Error) {
      settle(function onMqttProbeFailed() {
        teardown(function afterMqttProbeError() {
          reject(error);
        });
      });
    });
  });
}

export type CarMqttCredentials = {
  /** MQTT username — the car UUID string. */
  username: string;
  /** Plaintext secret, returned only at provision/rotate time. */
  password: string;
  /** Topic pattern the device may publish to. */
  publishTopic: string;
  /** True when an existing credential was replaced. */
  rotated: boolean;
};

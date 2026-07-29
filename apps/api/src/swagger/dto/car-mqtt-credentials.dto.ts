import { ApiProperty } from '@nestjs/swagger';

export class CarMqttCredentialsDto {
  @ApiProperty({
    format: 'uuid',
    description: 'MQTT username (the car UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  username!: string;

  @ApiProperty({
    description: 'Plaintext MQTT password — returned only at provision/rotate',
    example: 'xK9_mQ2vR7nP4sT1wY8zA0bC3dE6fG...',
  })
  password!: string;

  @ApiProperty({
    description: 'Topic pattern the device may publish to',
    example: 'telemetry/a1b2c3d4-e5f6-7890-abcd-ef1234567890/#',
  })
  publishTopic!: string;

  @ApiProperty({
    description: 'True when an existing credential was replaced',
    example: false,
  })
  rotated!: boolean;
}

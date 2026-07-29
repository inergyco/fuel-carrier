import { Module } from '@nestjs/common';
import { MqttCredentialsService } from './mqtt-credentials.service';

@Module({
  providers: [MqttCredentialsService],
  exports: [MqttCredentialsService],
})
export class MqttModule {}

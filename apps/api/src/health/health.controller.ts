import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import type { ReadinessResult } from './health.types';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Returns 200 when the API process is running. Does not check dependencies.',
  })
  getLiveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Returns 200 when required dependencies (Postgres, Redis, and Mosquitto when MQTT_URL is set) are reachable; otherwise 503.',
  })
  async getReadiness(): Promise<ReadinessResult> {
    const result = await this.healthService.checkReadiness();

    if (result.status === 'ok') {
      return result;
    }

    throw new ServiceUnavailableException(result);
  }
}

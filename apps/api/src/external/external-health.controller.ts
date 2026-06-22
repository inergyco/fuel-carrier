import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelopeOkResponse } from '../swagger/decorators/api-envelope.decorator';
import { HealthStatusDto } from '../swagger/dto/health-status.dto';

@ApiTags('health')
@Controller('external')
export class ExternalHealthController {
  @Get()
  @ApiOperation({ summary: 'External API health check' })
  @ApiEnvelopeOkResponse(HealthStatusDto)
  getStatus(): HealthStatusDto {
    return { status: 'ok' };
  }
}

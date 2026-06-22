import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelopeOkResponse } from '../swagger/decorators/api-envelope.decorator';
import { HealthStatusDto } from '../swagger/dto/health-status.dto';

@ApiTags('health')
@Controller('internal')
export class InternalHealthController {
  @Get()
  @ApiOperation({ summary: 'Internal API health check' })
  @ApiEnvelopeOkResponse(HealthStatusDto)
  getStatus(): HealthStatusDto {
    return { status: 'ok' };
  }
}

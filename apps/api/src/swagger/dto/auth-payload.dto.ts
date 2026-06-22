import { ApiProperty } from '@nestjs/swagger';
import { AdminSessionDto } from './admin-session.dto';

export class AuthPayloadDto {
  @ApiProperty({ type: AdminSessionDto })
  user!: AdminSessionDto;
}

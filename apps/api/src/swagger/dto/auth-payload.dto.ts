import { ApiProperty } from '@nestjs/swagger';
import { AuthSessionDto } from './admin-session.dto';

export class AuthPayloadDto {
  @ApiProperty({ type: AuthSessionDto })
  user!: AuthSessionDto;
}

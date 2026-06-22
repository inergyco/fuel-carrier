import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiFieldErrorDto {
  @ApiProperty({ example: 'username' })
  field!: string;

  @ApiProperty({ example: 'Username is required' })
  message!: string;
}

export class ApiErrorBodyDto {
  @ApiProperty({ example: 'UNAUTHORIZED' })
  code!: string;

  @ApiProperty({ example: 'Unauthorized' })
  message!: string;

  @ApiPropertyOptional({ type: [ApiFieldErrorDto] })
  fields?: ApiFieldErrorDto[];
}

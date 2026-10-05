import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverImageUploadDto {
  @ApiProperty({
    example:
      '/api/uploads/driver-images/550e8400-e29b-41d4-a716-446655440000.png',
  })
  imageUrl!: string;
}

export class ReplaceDriverImageRequestDto {
  @ApiProperty({
    example:
      '/api/uploads/driver-images/550e8400-e29b-41d4-a716-446655440000.png',
  })
  imageUrl!: string;
}

/** Minimal driver shape for Swagger envelopes — not a full Nest validation DTO. */
export class DriverDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  nationalId!: string;

  @ApiProperty()
  mobileNumber!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  imageUrl!: string | null;

  @ApiProperty({ format: 'uuid' })
  companyId!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  deletedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

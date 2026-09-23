import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Acme Logistics' })
  name!: string;

  @ApiProperty({ example: '12345678901' })
  nationalId!: string;

  @ApiProperty({ example: '+98 21 1234 5678' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: '123 Main St, Tehran' })
  address!: string | null;

  @ApiPropertyOptional({ example: 'Preferred carrier for north region' })
  note!: string | null;

  @ApiPropertyOptional({
    example: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Shell_logo.svg',
  })
  logoUrl!: string | null;
}

export class CreateCompanyRequestDto {
  @ApiProperty({ example: 'Acme Logistics' })
  name!: string;

  @ApiProperty({ example: '12345678901' })
  nationalId!: string;

  @ApiProperty({ example: '+98 21 1234 5678' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: '123 Main St, Tehran' })
  address?: string;

  @ApiPropertyOptional({ example: 'Preferred carrier for north region' })
  note?: string;

  @ApiPropertyOptional({
    example: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Shell_logo.svg',
  })
  logoUrl?: string;
}

/** True partial PATCH — omitted fields stay unchanged. */
export class UpdateCompanyRequestDto extends PartialType(
  CreateCompanyRequestDto,
) {}

export class CompanyDeletionImpactDto {
  @ApiProperty({ example: 12, description: 'Cars that cascade-delete' })
  cars!: number;

  @ApiProperty({ example: 8, description: 'Drivers that cascade-delete' })
  drivers!: number;

  @ApiProperty({
    example: 3,
    description: 'Company users that cascade-delete',
  })
  users!: number;
}

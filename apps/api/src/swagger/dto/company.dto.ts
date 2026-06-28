import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class UpdateCompanyRequestDto extends CreateCompanyRequestDto {}

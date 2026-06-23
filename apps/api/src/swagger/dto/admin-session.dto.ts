import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@fuel-carrier/shared-types';

export class AuthSessionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiProperty({ enum: [UserRole.INTERNAL_ADMIN, UserRole.COMPANY_USER] })
  role!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  companyId?: string;

  @ApiProperty({ example: 'superadmin' })
  username!: string;

  @ApiProperty({ example: 'Super' })
  firstName!: string;

  @ApiProperty({ example: 'Admin' })
  lastName!: string;

  @ApiPropertyOptional({ example: true })
  mustChangePassword?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';

export class AdminSessionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  adminId!: string;

  @ApiProperty({ example: 'superadmin' })
  username!: string;

  @ApiProperty({ example: 'Super' })
  firstName!: string;

  @ApiProperty({ example: 'Admin' })
  lastName!: string;
}

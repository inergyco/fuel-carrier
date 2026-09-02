import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CarDriverAssignmentDriverDto {
  @ApiProperty({ example: 'Ali' })
  firstName!: string;

  @ApiProperty({ example: 'Rezaei' })
  lastName!: string;
}

class CarDriverAssignmentActorDto {
  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;
}

export class CarDriverAssignmentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  carId!: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  driverId!: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440003',
    nullable: true,
  })
  companyId!: string | null;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional({
    example: '2026-02-01T08:00:00.000Z',
    nullable: true,
  })
  unassignedAt!: Date | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440004',
    nullable: true,
  })
  assignedByUserId!: string | null;

  @ApiPropertyOptional({ type: CarDriverAssignmentDriverDto, nullable: true })
  driver!: CarDriverAssignmentDriverDto | null;

  @ApiPropertyOptional({ type: CarDriverAssignmentActorDto, nullable: true })
  assignedBy!: CarDriverAssignmentActorDto | null;
}

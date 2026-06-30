import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  companyId!: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  actorUserId!: string | null;

  @ApiProperty({ example: 'company_user' })
  actorRole!: string;

  @ApiProperty({ example: 'jane_doe' })
  actorUsername!: string;

  @ApiProperty({ example: 'Jane Doe' })
  actorDisplayName!: string;

  @ApiProperty({ example: 'driver.created' })
  action!: string;

  @ApiPropertyOptional({ example: 'driver', nullable: true })
  entityType!: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440003',
    nullable: true,
  })
  entityId!: string | null;

  @ApiProperty({
    example: { changes: { firstName: { from: 'Ali', to: 'Reza' } } },
  })
  metadata!: Record<string, unknown>;

  @ApiPropertyOptional({ example: '192.168.1.1', nullable: true })
  ipAddress!: string | null;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0',
    nullable: true,
  })
  userAgent!: string | null;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  createdAt!: Date;
}

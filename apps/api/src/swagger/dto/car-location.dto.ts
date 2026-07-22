import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarLocationMarkerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  carId!: string;

  @ApiProperty({ example: 35.7575 })
  latitude!: number;

  @ApiProperty({ example: 51.4097 })
  longitude!: number;

  @ApiProperty({ example: '2026-07-22T10:19:48.680Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ example: 'تریلی ۳۶۰۰۰ لیتر', nullable: true })
  name!: string | null;

  @ApiProperty({ example: '۱۲ب۳۴۵-۶۷' })
  licensePlate!: string;
}

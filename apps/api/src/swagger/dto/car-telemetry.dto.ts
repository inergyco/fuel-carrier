import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarTelemetryMarkerDto {
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

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  companyId!: string;

  @ApiPropertyOptional({ example: 'Pars Fuel', nullable: true })
  companyName?: string;

  @ApiPropertyOptional({ example: 42.5 })
  speed?: number;

  @ApiPropertyOptional({ example: 1140 })
  remainFuel?: number;

  @ApiPropertyOptional({ example: 14.76 })
  fuelAmount?: number;

  @ApiPropertyOptional({
    example: {
      tankToGround: 5.34,
      tankToNozzle: 4.25,
      groundToVehicle: 1.8,
    },
  })
  resistance?: {
    tankToGround: number;
    tankToNozzle: number;
    groundToVehicle: number;
  };
}

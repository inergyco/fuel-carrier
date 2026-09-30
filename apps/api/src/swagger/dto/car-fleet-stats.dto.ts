import { ApiProperty } from '@nestjs/swagger';

export class CarFleetStatsDto {
  @ApiProperty({ example: 24 })
  totalCars!: number;

  @ApiProperty({
    example: 10,
    description: 'Cars with remainFuel ≥ 75% capacity',
  })
  fuelHigh!: number;

  @ApiProperty({
    example: 6,
    description: 'Cars with remainFuel 50–75% capacity',
  })
  fuelMidHigh!: number;

  @ApiProperty({
    example: 5,
    description: 'Cars with remainFuel 25–50% capacity',
  })
  fuelMidLow!: number;

  @ApiProperty({
    example: 3,
    description: 'Cars with remainFuel under 25% capacity',
  })
  fuelLow!: number;

  @ApiProperty({
    example: 8,
    description: 'Cars flagged for high-grade petrol',
  })
  highGrade!: number;
}

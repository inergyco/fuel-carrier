import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCarPricingRequestDto {
  @ApiPropertyOptional({ example: 15000, nullable: true })
  petrolPricePerLiter!: number | null;

  @ApiPropertyOptional({ example: 100, nullable: true })
  feeThresholdX!: number | null;

  @ApiPropertyOptional({ example: 500, nullable: true })
  feeThresholdY!: number | null;

  @ApiPropertyOptional({ example: 1000, nullable: true })
  feeThresholdZ!: number | null;

  @ApiPropertyOptional({ example: 50000, nullable: true })
  feeUpToX!: number | null;

  @ApiPropertyOptional({ example: 100000, nullable: true })
  feeXToY!: number | null;

  @ApiPropertyOptional({ example: 200000, nullable: true })
  feeYToZ!: number | null;

  @ApiPropertyOptional({ example: 300000, nullable: true })
  feeAboveZ!: number | null;
}

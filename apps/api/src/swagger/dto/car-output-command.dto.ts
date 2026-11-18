import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarOutputActions } from '@fuel-carrier/shared-types';

export class CarOutputCommandRequestDto {
  @ApiProperty({
    enum: [CarOutputActions.ENABLE, CarOutputActions.DISABLE],
    example: CarOutputActions.DISABLE,
  })
  action!: 'enable' | 'disable';
}

export class CarOutputPinsDto {
  @ApiProperty({ example: true })
  gpio25!: boolean;

  @ApiProperty({ example: true })
  gpio26!: boolean;
}

export class CarOutputCommandResultDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    enum: [CarOutputActions.ENABLE, CarOutputActions.DISABLE],
    example: CarOutputActions.DISABLE,
  })
  action!: 'enable' | 'disable';

  @ApiProperty({ example: 42 })
  commandId!: number;

  @ApiProperty({ example: 'outputs disabled' })
  message!: string;

  @ApiPropertyOptional({ type: CarOutputPinsDto })
  pins?: CarOutputPinsDto;

  @ApiPropertyOptional({ example: '2026-11-13T16:05:01+03:30' })
  deviceTime?: string;
}

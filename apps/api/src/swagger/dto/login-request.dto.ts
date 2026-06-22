import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'superadmin' })
  username!: string;

  @ApiProperty({ example: 'ChangeMe1!Strong' })
  password!: string;
}

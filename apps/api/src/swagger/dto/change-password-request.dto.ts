import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'CurrentPass123!' })
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecurePass456!' })
  newPassword!: string;

  @ApiProperty({ example: 'NewSecurePass456!' })
  confirmPassword!: string;
}

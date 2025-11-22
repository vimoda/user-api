import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type LoginType = 'email' | 'phone';

export class LoginDto {
  @ApiProperty({
    description: 'Tipo de login',
    example: 'email',
    enum: ['email', 'phone']
  })
  @IsIn(['email', 'phone'])
  loginType!: LoginType;

  @ApiProperty({
    description: 'Identificador del usuario (email o teléfono según loginType)',
    example: 'user@example.com'
  })
  @IsNotEmpty()
  @IsString()
  identifier!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123'
  })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    description: 'Realm para autenticación',
    example: 'default'
  })
  @IsOptional()
  @IsString()
  realm?: string = 'default';
}

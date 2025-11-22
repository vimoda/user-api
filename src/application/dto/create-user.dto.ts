import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsPhoneNumber, ValidateIf, IsNotEmpty as IsNotEmptyValidator } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'user@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+5491123456789'
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

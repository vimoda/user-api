import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenDto {
  @ApiProperty({
    description: 'Token JWT a validar',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsNotEmpty()
  token!: string;
}
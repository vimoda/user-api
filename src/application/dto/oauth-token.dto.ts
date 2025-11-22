import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthTokenDto {
  @ApiProperty({
    description: 'Tipo de grant',
    example: 'password',
    enum: ['password', 'client_credentials']
  })
  @IsIn(['password', 'client_credentials'])
  @IsNotEmpty()
  grant_type!: string;

  @ApiPropertyOptional({
    description: 'Username (requerido para password grant)',
    example: 'user@example.com'
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Password (requerido para password grant)',
    example: 'password123'
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Client ID',
    example: 'my-client-app'
  })
  @IsNotEmpty()
  @IsString()
  client_id!: string;

  @ApiProperty({
    description: 'Client Secret',
    example: 'my-client-secret'
  })
  @IsNotEmpty()
  @IsString()
  client_secret!: string;

  @ApiPropertyOptional({
    description: 'Scope solicitado',
    example: 'read write'
  })
  @IsOptional()
  @IsString()
  scope?: string;
}
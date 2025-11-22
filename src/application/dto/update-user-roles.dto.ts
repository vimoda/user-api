import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'Lista de roles del usuario',
    example: ['admin', 'seller', 'client'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];
}
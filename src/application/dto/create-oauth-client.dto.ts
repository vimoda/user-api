import { IsString, IsOptional, IsArray, IsUrl, IsIn } from 'class-validator';

export class CreateOAuthClientDto {
  @IsString()
  clientName!: string;

  @IsOptional()
  @IsString()
  clientDescription?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  redirectUris!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsIn(['authorization_code', 'implicit', 'password', 'client_credentials', 'refresh_token'], { each: true })
  grantTypes!: string[];

  @IsArray()
  @IsString({ each: true })
  scopes!: string[];
}
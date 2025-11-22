import { IsString, IsOptional, IsArray, IsUrl, IsIn, IsBoolean } from 'class-validator';

export class UpdateOAuthClientDto {
  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientDescription?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  redirectUris?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['authorization_code', 'implicit', 'password', 'client_credentials', 'refresh_token'], { each: true })
  grantTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
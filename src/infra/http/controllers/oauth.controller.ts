import { Body, Controller, Post, UsePipes, ValidationPipe, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { OAuthTokenDto } from '../../../application/dto/oauth-token.dto';
import { OAuthTokenUseCase } from '../../../application/use-cases/oauth-token.usecase';

@ApiTags('oauth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthTokenUseCase: OAuthTokenUseCase) {}

  @Post('token')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({
    summary: 'Obtener token OAuth 2.0',
    description: 'Endpoint OAuth 2.0 para obtener access tokens usando diferentes grant types'
  })
  @ApiBody({
    type: OAuthTokenDto,
    description: 'Parámetros OAuth 2.0'
  })
  @ApiHeader({
    name: 'Content-Type',
    description: 'Debe ser application/x-www-form-urlencoded',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Token generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJSUzI1NiIs...' },
        token_type: { type: 'string', example: 'Bearer' },
        expires_in: { type: 'number', example: 3600 },
        scope: { type: 'string', example: 'read write' },
        refresh_token: { type: 'string', example: 'eyJhbGciOiJSUzI1NiIs...' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async token(@Body() dto: OAuthTokenDto) {
    return this.oauthTokenUseCase.execute({
      grant_type: dto.grant_type as 'password' | 'client_credentials',
      username: dto.username,
      password: dto.password,
      client_id: dto.client_id,
      client_secret: dto.client_secret,
      scope: dto.scope
    });
  }
}
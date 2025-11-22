import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { AuthServicePort } from '../../domain/ports/auth.service.port';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { OAuthClientRepositoryPort } from '../../domain/ports/oauth-client.repository.port';

export interface OAuthTokenRequest {
  grant_type: 'password' | 'client_credentials';
  username?: string;
  password?: string;
  client_id: string;
  client_secret: string;
  scope?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
}

@Injectable()
export class OAuthTokenUseCase {
  constructor(
    @Inject('AuthServicePort') private readonly authService: AuthServicePort,
    @Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort,
    @Inject('OAuthClientRepositoryPort') private readonly oauthClientRepository: OAuthClientRepositoryPort
  ) {}

  async execute(request: OAuthTokenRequest): Promise<OAuthTokenResponse> {
    // Validate client credentials against registered clients
    const client = await this.validateClientCredentials(request.client_id, request.client_secret);

    let userId: string;
    let roles: string[] = [];

    if (request.grant_type === 'password') {
      // Resource Owner Password Credentials Grant
      if (!request.username || !request.password) {
        throw new BadRequestException('username and password are required for password grant');
      }

      // Check if client supports password grant
      if (!client.grantTypes.includes('password')) {
        throw new BadRequestException('Client does not support password grant type');
      }

      const user = await this.userRepository.findByEmail(request.username);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isValidPassword = await this.authService.comparePassword(request.password, user.passwordHash);
      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      userId = user.id;
      roles = user.roles;
    } else if (request.grant_type === 'client_credentials') {
      // Client Credentials Grant - client acts on behalf of itself
      if (!client.grantTypes.includes('client_credentials')) {
        throw new BadRequestException('Client does not support client_credentials grant type');
      }

      userId = `client:${request.client_id}`;
      roles = ['client']; // Default role for client applications
    } else {
      throw new BadRequestException('Unsupported grant_type');
    }

    // Generate tokens
    const accessToken = await this.authService.generateToken(userId, roles, 'default');
    const refreshToken = await this.authService.generateRefreshToken(userId, 'default');

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      scope: request.scope,
      refresh_token: refreshToken
    };
  }

  private async validateClientCredentials(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    const client = await this.oauthClientRepository.validateClientCredentials(clientId, clientSecret);
    if (!client) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    return client;
  }
}
import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { AuthServicePort } from '../../domain/ports/auth.service.port';
import { InvalidCredentialsException } from '../../infra/http/exceptions/business.exceptions';
import { LoginType } from '../dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UserRepositoryPort') private readonly usersRepo: UserRepositoryPort,
    @Inject('AuthServicePort') private readonly auth: AuthServicePort
  ) {}

  async execute(payload: { loginType: LoginType; identifier: string; password: string; realm?: string }) {
    const realm = payload.realm || 'default';

    // Find user by login type
    let user = null;
    if (payload.loginType === 'email') {
      user = await this.usersRepo.findByEmail(payload.identifier);
    } else if (payload.loginType === 'phone') {
      user = await this.usersRepo.findByPhone(payload.identifier);
    }

    if (!user) throw new InvalidCredentialsException();

    const match = await this.auth.comparePassword(payload.password, user.passwordHash);
    if (!match) throw new InvalidCredentialsException();

    const accessToken = await this.auth.generateToken(user.id, user.roles, realm);
    const refreshToken = await this.auth.generateRefreshToken(user.id, realm);
    const accessTokenExpiration = await this.auth.getTokenExpiration(accessToken);
    const refreshTokenExpiration = await this.auth.getRefreshTokenExpiration(refreshToken);

    // Update refresh token using the repository
    await this.usersRepo.updateRefreshToken(user.id, refreshToken, refreshTokenExpiration);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60, // 15 minutes in seconds
      refresh_expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
      access_token_expires_at: accessTokenExpiration.toISOString(),
      refresh_token_expires_at: refreshTokenExpiration.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { AuthServicePort } from '../../domain/ports/auth.service.port';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('UserRepositoryPort') private readonly usersRepo: UserRepositoryPort,
    @Inject('AuthServicePort') private readonly auth: AuthServicePort
  ) {}

  async execute(refreshToken: string) {
    const user = await this.usersRepo.findByRefreshToken(refreshToken);
    if (!user) throw new Error('INVALID_REFRESH_TOKEN: User not found for token');

    try {
      const decoded = await this.auth.verifyRefreshToken(refreshToken);
      if (decoded.sub !== user.id) throw new Error('INVALID_REFRESH_TOKEN: Subject mismatch');

      // Generate new tokens - use realm from decoded token or default
      const realm = decoded.aud || 'default';
      const newAccessToken = await this.auth.generateToken(user.id, user.roles, realm);
      const newRefreshToken = await this.auth.generateRefreshToken(user.id, realm);
      const newRefreshTokenExpiration = await this.auth.getRefreshTokenExpiration(newRefreshToken);

      // Update stored refresh token
      await this.usersRepo.updateRefreshToken(user.id, newRefreshToken, newRefreshTokenExpiration);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 15 * 60,
        refresh_expires_in: 7 * 24 * 60 * 60,
        user: { id: user.id, email: user.email, roles: user.roles }
      };
    } catch (error) {
      // Token expired or invalid, remove it
      await this.usersRepo.removeRefreshToken(user.id);
      throw new Error(`REFRESH_TOKEN_EXPIRED: ${(error as Error).message}`);
    }
  }
}
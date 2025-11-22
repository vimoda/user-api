import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { AuthServicePort } from '../../domain/ports/auth.service.port';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('UserRepositoryPort') private readonly usersRepo: UserRepositoryPort,
    @Inject('AuthServicePort') private readonly auth: AuthServicePort
  ) {}

  async execute(accessToken: string) {
    try {
      const decoded = await this.auth.verifyToken(accessToken);
      const user = await this.usersRepo.findById(decoded.sub);
      if (!user) throw new Error('USER_NOT_FOUND');

      const expiration = await this.auth.getTokenExpiration(accessToken);

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles
        },
        expires_at: expiration.toISOString(),
        issued_at: new Date(decoded.iat * 1000).toISOString()
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'INVALID_TOKEN'
      };
    }
  }
}
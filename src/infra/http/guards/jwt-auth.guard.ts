import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException('NO_TOKEN');

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException('INVALID_TOKEN');

    const token = parts[1];
    try {
      // Use RSA public key for verification
      const publicKeyPath = this.configService.get<string>('realms.default.publicKeyPath', 'keys/public.pem');
      const publicKey = fs.readFileSync(path.join(process.cwd(), publicKeyPath), 'utf8');

      const payload = this.jwtService.verify(token, {
        publicKey: publicKey,
        algorithms: ['RS256']
      });

      // Extract roles from the extended JWT payload (Keycloak format)
      const roles = payload.realm_access?.roles || [];
      (req as any).user = {
        id: payload.sub,
        roles: roles,
        realm: payload.iss,
        clientId: payload.azp,
        scope: payload.scope
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException('TOKEN_EXPIRED_OR_INVALID');
    }
  }
}

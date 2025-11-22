import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import { AuthServicePort } from '../../domain/ports/auth.service.port';
import { RealmService } from './realm.service';

@Injectable()
export class JwtServiceAdapter implements AuthServicePort {
  private privateKey: string = '';
  private publicKey: string = '';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly realmService: RealmService
  ) {
    this.loadKeys();
  }

  private loadKeys() {
    try {
      const privateKeyPath = path.join(process.cwd(), 'keys', 'private.pem');
      const publicKeyPath = path.join(process.cwd(), 'keys', 'public.pem');

      this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    } catch (error) {
      console.error('Error loading RSA keys:', error);
      // Fallback to symmetric for development
      this.privateKey = process.env.JWT_SECRET || 'hard-secret';
      this.publicKey = process.env.JWT_SECRET || 'hard-secret';
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateToken(userId: string, roles: string[], realmName: string = 'default', additionalClaims?: any): Promise<string> {
    const realm = this.realmService.getRealm(realmName);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const jti = this.generateJti(); // JWT ID único

    const payload = {
      // Standard JWT claims
      iss: realm.issuer,
      sub: userId,
      aud: realm.audience,
      exp: Math.floor(Date.now() / 1000) + this.parseTimeToSeconds(realm.accessTokenExpiresIn),
      iat: now,
      nbf: now,
      jti: jti,

      // Additional claims like Keycloak
      typ: 'Bearer',
      azp: additionalClaims?.clientId || 'users-api',
      acr: '1',
      scope: additionalClaims?.scope || 'openid profile email',
      client_id: additionalClaims?.clientId || 'users-api',
      clientHost: additionalClaims?.clientHost || 'localhost',
      clientAddress: additionalClaims?.clientAddress || '127.0.0.1',
      preferred_username: additionalClaims?.username || `user-${userId}`,
      email_verified: additionalClaims?.emailVerified || false,

      // Access claims
      realm_access: {
        roles: roles
      },
      resource_access: {
        'users-api': {
          roles: roles
        }
      },

      // Custom claims
      ...additionalClaims
    };

    // Generate token with kid in header using jsonwebtoken directly
    const kid = this.getCurrentKeyId();
    const privateKey = fs.readFileSync(this.getPrivateKeyPath(), 'utf8');
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        typ: 'JWT',
        kid: kid
      }
    });

    return token;
  }

  async verifyToken(token: string): Promise<any> {
    const publicKey = fs.readFileSync(this.getPublicKeyPath(), 'utf8');
    return this.jwtService.verifyAsync(token, {
      publicKey: publicKey,
      algorithms: ['RS256']
    });
  }

  async generateRefreshToken(userId: string, realmName: string = 'default'): Promise<string> {
    const realm = this.realmService.getRealm(realmName);
    const now = Math.floor(Date.now() / 1000);
    const kid = this.getCurrentKeyId();

    const payload = {
      sub: userId,
      type: 'refresh',
      // Standard JWT claims
      iss: realm.issuer,
      aud: realm.audience,
      exp: Math.floor(Date.now() / 1000) + this.parseTimeToSeconds(realm.refreshTokenExpiresIn),
      iat: now,
      nbf: now
    };

    // Use jsonwebtoken directly to have control over the header
    const privateKey = fs.readFileSync(this.getPrivateKeyPath(), 'utf8');
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        typ: 'JWT',
        kid: kid
      }
    });

    return token;
  }

  async verifyRefreshToken(token: string): Promise<any> {
    const publicKey = fs.readFileSync(this.getPublicKeyPath(), 'utf8');
    return this.jwtService.verifyAsync(token, {
      publicKey: publicKey,
      algorithms: ['RS256']
    });
  }

  async getTokenExpiration(token: string): Promise<Date> {
    const decoded = await this.verifyToken(token);
    return new Date(decoded.exp * 1000);
  }

  async getRefreshTokenExpiration(token: string): Promise<Date> {
    const decoded = await this.verifyRefreshToken(token);
    return new Date(decoded.exp * 1000);
  }

  private parseTimeToSeconds(timeString: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = timeString.match(regex);

    if (!match) {
      throw new Error(`Invalid time format: ${timeString}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value; // seconds
      case 'm': return value * 60; // minutes
      case 'h': return value * 3600; // hours
      case 'd': return value * 86400; // days
      default: throw new Error(`Unknown time unit: ${unit}`);
    }
  }

  private generateJti(): string {
    return require('crypto').randomUUID();
  }

  private getCurrentKeyId(): string {
    // For RSA keys, we can use a hash of the public key or a fixed ID
    // For now, return a fixed kid
    return 'rsa-key-1';
  }

  private getPrivateKeyPath(): string {
    const realm = this.realmService.getRealm('default'); // or get from context
    return path.join(process.cwd(), realm.privateKeyPath);
  }

  private getPublicKeyPath(): string {
    const realm = this.realmService.getRealm('default'); // or get from context
    return path.join(process.cwd(), realm.publicKeyPath);
  }
}

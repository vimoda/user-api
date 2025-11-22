import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class CertsService {
  private publicKey: string = '';
  private jwk: any = {};

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    try {
      const publicKeyPath = path.join(process.cwd(), 'keys', 'public.pem');
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');

      // Convertir PEM a JWK
      const publicKeyObj = crypto.createPublicKey(this.publicKey);
      const jwk = publicKeyObj.export({ format: 'jwk' });

      this.jwk = {
        kty: jwk.kty,
        use: 'sig',
        kid: 'rsa-key-1', // Key ID
        n: jwk.n,
        e: jwk.e,
        alg: 'RS256'
      };
    } catch (error) {
      console.error('Error loading keys:', error);
      // Fallback to hardcoded for development
      this.jwk = {
        kty: 'RSA',
        use: 'sig',
        kid: 'fallback-key',
        n: 'fallback-modulus',
        e: 'AQAB',
        alg: 'RS256'
      };
    }
  }

  getPublicKeyJWK() {
    return {
      keys: [this.jwk]
    };
  }

  getPublicKey() {
    return this.publicKey;
  }
}
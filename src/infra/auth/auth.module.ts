import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtServiceAdapter } from './jwt.service.adapter';
import { CertsController } from './certs.controller';
import { CertsService } from './certs.service';
import { RealmService } from './realm.service';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        let privateKey: string;
        let publicKey: string;

        try {
          const privateKeyPath = path.join(process.cwd(), 'keys', 'private.pem');
          const publicKeyPath = path.join(process.cwd(), 'keys', 'public.pem');
          privateKey = fs.readFileSync(privateKeyPath, 'utf8');
          publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        } catch (error) {
          console.warn('RSA keys not found, using symmetric fallback');
          privateKey = configService.get<string>('jwt.secret') || 'hard-secret';
          publicKey = configService.get<string>('jwt.secret') || 'hard-secret';
        }

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256'
            // issuer and audience removed - now handled in payload
          }
          // verifyOptions removed - verification handled manually with RSA
        };
      },
      inject: [ConfigService]
    })
  ],
  controllers: [CertsController],
  providers: [JwtServiceAdapter, CertsService, RealmService],
  exports: [JwtServiceAdapter, JwtModule, CertsService, RealmService]
})
export class AuthModule {}

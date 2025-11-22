import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { OAuthController } from './controllers/oauth.controller';
import { OAuthClientController } from './controllers/oauth-client.controller';
import { HealthController } from './controllers/health.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../../app/user.module';
import { OAuthClientModule } from '../../app/oauth-client.module';

@Module({
  imports: [JwtModule.register({}), UserModule, OAuthClientModule],
  controllers: [UserController, OAuthController, OAuthClientController, HealthController],
  providers: [JwtAuthGuard, AdminGuard],
  exports: []
})
export class HttpModule {}

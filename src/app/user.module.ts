import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../infra/persistence/schemas/user.schema';
import { CreateUserUseCase } from '../application/use-cases/create-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { ValidateTokenUseCase } from '../application/use-cases/validate-token.usecase';
import { UpdateUserRolesUseCase } from '../application/use-cases/update-user-roles.usecase';
import { FindUserByIdUseCase } from '../application/use-cases/find-user-by-id.usecase';
import { OAuthTokenUseCase } from '../application/use-cases/oauth-token.usecase';
import { AuthServicePort } from '../domain/ports/auth.service.port';
import { JwtServiceAdapter } from '../infra/auth/jwt.service.adapter';
import { PersistenceModule } from '../infra/persistence/persistence.module';
import { AuthModule } from '../infra/auth/auth.module';

@Module({
  imports: [PersistenceModule, AuthModule, MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    UpdateUserRolesUseCase,
    FindUserByIdUseCase,
    OAuthTokenUseCase,
    {
      provide: 'AuthServicePort',
      useClass: JwtServiceAdapter,
    },
  ],
  exports: [CreateUserUseCase, LoginUseCase, RefreshTokenUseCase, ValidateTokenUseCase, UpdateUserRolesUseCase, FindUserByIdUseCase, OAuthTokenUseCase],
})
export class UserModule {}

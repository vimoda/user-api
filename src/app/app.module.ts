import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../application/use-cases/create-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { ConfigModule } from '@nestjs/config';
import { configuration, envValidationSchema } from '../config';
import { UserModule } from './user.module';
import { HttpModule } from '../infra/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    UserModule,
    HttpModule,
  ],
})

export class AppModule {}



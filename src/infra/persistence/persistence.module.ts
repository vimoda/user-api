import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { OAuthClientSchema } from './schemas/oauth-client.schema';
import { UserRepositoryAdapter } from './user.repository.adapter';
import { OAuthClientRepositoryAdapter } from './oauth-client.repository.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'OAuthClient', schema: OAuthClientSchema }
    ])
  ],
  providers: [
    {
      provide: 'UserRepositoryPort',
      useClass: UserRepositoryAdapter,
    },
    {
      provide: 'OAuthClientRepositoryPort',
      useClass: OAuthClientRepositoryAdapter,
    }
  ],
  exports: ['UserRepositoryPort', 'OAuthClientRepositoryPort']
})
export class PersistenceModule {}

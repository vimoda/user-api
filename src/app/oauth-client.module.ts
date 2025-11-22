import { Module } from '@nestjs/common';
import { CreateOAuthClientUseCase } from '../application/use-cases/create-oauth-client.usecase';
import { ListOAuthClientsUseCase } from '../application/use-cases/list-oauth-clients.usecase';
import { UpdateOAuthClientUseCase } from '../application/use-cases/update-oauth-client.usecase';
import { DeleteOAuthClientUseCase } from '../application/use-cases/delete-oauth-client.usecase';
import { PersistenceModule } from '../infra/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [
    CreateOAuthClientUseCase,
    ListOAuthClientsUseCase,
    UpdateOAuthClientUseCase,
    DeleteOAuthClientUseCase
  ],
  exports: [
    CreateOAuthClientUseCase,
    ListOAuthClientsUseCase,
    UpdateOAuthClientUseCase,
    DeleteOAuthClientUseCase
  ]
})
export class OAuthClientModule {}
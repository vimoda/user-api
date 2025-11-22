import { Injectable, Inject } from '@nestjs/common';
import { OAuthClientRepositoryPort } from '../../domain/ports/oauth-client.repository.port';
import { OAuthClientEntity } from '../../domain/entities/oauth-client.entity';

export interface OAuthClientSummary {
  id: string;
  clientId: string;
  clientName: string;
  clientDescription?: string;
  grantTypes: string[];
  scopes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ListOAuthClientsUseCase {
  constructor(
    @Inject('OAuthClientRepositoryPort')
    private readonly oauthClientRepository: OAuthClientRepositoryPort
  ) {}

  async execute(userId: string): Promise<OAuthClientSummary[]> {
    const clients = await this.oauthClientRepository.findByCreator(userId);
    return clients.map(client => ({
      id: client.id,
      clientId: client.clientId,
      clientName: client.clientName,
      clientDescription: client.clientDescription,
      grantTypes: client.grantTypes,
      scopes: client.scopes,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));
  }
}
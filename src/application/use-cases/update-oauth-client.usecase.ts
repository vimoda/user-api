import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OAuthClientRepositoryPort } from '../../domain/ports/oauth-client.repository.port';
import { OAuthClientEntity } from '../../domain/entities/oauth-client.entity';

export interface UpdateOAuthClientDto {
  clientName?: string;
  clientDescription?: string;
  redirectUris?: string[];
  grantTypes?: string[];
  scopes?: string[];
  isActive?: boolean;
}

export interface UpdateOAuthClientResult {
  id: string;
  clientId: string;
  clientName: string;
  clientDescription?: string;
  redirectUris: string[];
  grantTypes: string[];
  scopes: string[];
  isActive: boolean;
  updatedAt: Date;
}

@Injectable()
export class UpdateOAuthClientUseCase {
  constructor(
    @Inject('OAuthClientRepositoryPort')
    private readonly oauthClientRepository: OAuthClientRepositoryPort
  ) {}

  async execute(id: string, dto: UpdateOAuthClientDto, userId: string): Promise<UpdateOAuthClientResult> {
    const client = await this.oauthClientRepository.findById(id);
    if (!client || client.createdBy !== userId) {
      throw new NotFoundException('OAuth client not found or access denied');
    }

    const updatedClient = client.update(dto);
    const savedClient = await this.oauthClientRepository.update(updatedClient);

    return {
      id: savedClient.id,
      clientId: savedClient.clientId,
      clientName: savedClient.clientName,
      clientDescription: savedClient.clientDescription,
      redirectUris: savedClient.redirectUris,
      grantTypes: savedClient.grantTypes,
      scopes: savedClient.scopes,
      isActive: savedClient.isActive,
      updatedAt: savedClient.updatedAt
    };
  }
}
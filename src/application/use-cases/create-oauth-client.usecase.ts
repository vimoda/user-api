import { Injectable, Inject } from '@nestjs/common';
import { OAuthClientRepositoryPort } from '../../domain/ports/oauth-client.repository.port';
import { OAuthClientEntity } from '../../domain/entities/oauth-client.entity';

export interface CreateOAuthClientDto {
  clientName: string;
  clientDescription?: string;
  redirectUris: string[];
  grantTypes: string[];
  scopes: string[];
}

export interface CreateOAuthClientResult {
  clientId: string;
  clientSecret: string;
  clientName: string;
  clientDescription?: string;
  redirectUris: string[];
  grantTypes: string[];
  scopes: string[];
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class CreateOAuthClientUseCase {
  constructor(
    @Inject('OAuthClientRepositoryPort')
    private readonly oauthClientRepository: OAuthClientRepositoryPort
  ) {}

  async execute(dto: CreateOAuthClientDto, createdBy: string): Promise<CreateOAuthClientResult> {
    // Generate unique client credentials
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();

    const client = OAuthClientEntity.create({
      clientId,
      clientSecret,
      clientName: dto.clientName,
      clientDescription: dto.clientDescription,
      redirectUris: dto.redirectUris,
      grantTypes: dto.grantTypes,
      scopes: dto.scopes,
      createdBy
    });

    const savedClient = await this.oauthClientRepository.create(client);

    return {
      clientId: savedClient.clientId,
      clientSecret: savedClient.clientSecret,
      clientName: savedClient.clientName,
      clientDescription: savedClient.clientDescription,
      redirectUris: savedClient.redirectUris,
      grantTypes: savedClient.grantTypes,
      scopes: savedClient.scopes,
      isActive: savedClient.isActive,
      createdAt: savedClient.createdAt
    };
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateClientSecret(): string {
    return `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OAuthClientRepositoryPort } from '../../domain/ports/oauth-client.repository.port';

@Injectable()
export class DeleteOAuthClientUseCase {
  constructor(
    @Inject('OAuthClientRepositoryPort')
    private readonly oauthClientRepository: OAuthClientRepositoryPort
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const client = await this.oauthClientRepository.findById(id);
    if (!client || client.createdBy !== userId) {
      throw new NotFoundException('OAuth client not found or access denied');
    }

    await this.oauthClientRepository.delete(id);
  }
}
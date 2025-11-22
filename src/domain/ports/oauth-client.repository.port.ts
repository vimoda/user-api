import { OAuthClientEntity } from '../../domain/entities/oauth-client.entity';

export interface OAuthClientRepositoryPort {
  create(client: OAuthClientEntity): Promise<OAuthClientEntity>;
  findByClientId(clientId: string): Promise<OAuthClientEntity | null>;
  findById(id: string): Promise<OAuthClientEntity | null>;
  findAll(): Promise<OAuthClientEntity[]>;
  findByCreator(userId: string): Promise<OAuthClientEntity[]>;
  update(client: OAuthClientEntity): Promise<OAuthClientEntity>;
  delete(id: string): Promise<void>;
  validateClientCredentials(clientId: string, clientSecret: string): Promise<OAuthClientEntity | null>;
}
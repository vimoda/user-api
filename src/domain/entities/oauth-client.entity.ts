import { randomUUID } from 'crypto';

export class OAuthClientEntity {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly clientSecret: string,
    public readonly clientName: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly clientDescription?: string,
    public readonly redirectUris: string[] = [],
    public readonly grantTypes: string[] = ['client_credentials'],
    public readonly scopes: string[] = [],
    public readonly isActive: boolean = true
  ) {}

  static create(params: {
    clientId: string;
    clientSecret: string;
    clientName: string;
    clientDescription?: string;
    redirectUris?: string[];
    grantTypes?: string[];
    scopes?: string[];
    createdBy: string;
  }): OAuthClientEntity {
    const now = new Date();
    return new OAuthClientEntity(
      randomUUID(),
      params.clientId,
      params.clientSecret,
      params.clientName,
      params.createdBy,
      now,
      now,
      params.clientDescription,
      params.redirectUris || [],
      params.grantTypes || ['client_credentials'],
      params.scopes || [],
      true
    );
  }

  update(params: Partial<{
    clientName: string;
    clientDescription: string;
    redirectUris: string[];
    grantTypes: string[];
    scopes: string[];
    isActive: boolean;
  }>): OAuthClientEntity {
    return new OAuthClientEntity(
      this.id,
      this.clientId,
      this.clientSecret,
      params.clientName ?? this.clientName,
      this.createdBy,
      this.createdAt,
      new Date(),
      params.clientDescription ?? this.clientDescription,
      params.redirectUris ?? this.redirectUris,
      params.grantTypes ?? this.grantTypes,
      params.scopes ?? this.scopes,
      params.isActive ?? this.isActive
    );
  }
}
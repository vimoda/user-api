import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuthClientRepositoryPort } from '../../domain/ports/oauth-client.repository.port';
import { OAuthClientEntity } from '../../domain/entities/oauth-client.entity';

interface OAuthClientDoc {
  _id: string;
  clientId: string;
  clientSecret: string;
  clientName: string;
  clientDescription?: string;
  redirectUris: string[];
  grantTypes: string[];
  scopes: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OAuthClientRepositoryAdapter implements OAuthClientRepositoryPort {
  constructor(@InjectModel('OAuthClient') private oauthClientModel: Model<OAuthClientDoc>) {}

  private toEntity(doc: OAuthClientDoc | null): OAuthClientEntity | null {
    if (!doc) return null;
    return new OAuthClientEntity(
      doc._id,
      doc.clientId,
      doc.clientSecret,
      doc.clientName,
      doc.createdBy,
      doc.createdAt,
      doc.updatedAt,
      doc.clientDescription,
      doc.redirectUris,
      doc.grantTypes,
      doc.scopes,
      doc.isActive
    );
  }

  async create(client: OAuthClientEntity): Promise<OAuthClientEntity> {
    const doc = new this.oauthClientModel({
      _id: client.id,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      clientName: client.clientName,
      clientDescription: client.clientDescription,
      redirectUris: client.redirectUris,
      grantTypes: client.grantTypes,
      scopes: client.scopes,
      isActive: client.isActive,
      createdBy: client.createdBy,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    });
    await doc.save();
    return this.toEntity(doc)!;
  }

  async findByClientId(clientId: string): Promise<OAuthClientEntity | null> {
    const doc = await this.oauthClientModel.findOne({ clientId }).lean().exec();
    return this.toEntity(doc as any);
  }

  async findById(id: string): Promise<OAuthClientEntity | null> {
    const doc = await this.oauthClientModel.findById(id).lean().exec();
    return this.toEntity(doc as any);
  }

  async findAll(): Promise<OAuthClientEntity[]> {
    const docs = await this.oauthClientModel.find().lean().exec();
    return docs.map(doc => this.toEntity(doc as any)).filter(Boolean) as OAuthClientEntity[];
  }

  async findByCreator(userId: string): Promise<OAuthClientEntity[]> {
    const docs = await this.oauthClientModel.find({ createdBy: userId }).lean().exec();
    return docs.map(doc => this.toEntity(doc as any)).filter(Boolean) as OAuthClientEntity[];
  }

  async update(client: OAuthClientEntity): Promise<OAuthClientEntity> {
    await this.oauthClientModel.updateOne({ _id: client.id }, {
      $set: {
        clientName: client.clientName,
        clientDescription: client.clientDescription,
        redirectUris: client.redirectUris,
        grantTypes: client.grantTypes,
        scopes: client.scopes,
        isActive: client.isActive,
        updatedAt: client.updatedAt
      }
    }).exec();
    return this.findById(client.id) as Promise<OAuthClientEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.oauthClientModel.deleteOne({ _id: id }).exec();
  }

  async validateClientCredentials(clientId: string, clientSecret: string): Promise<OAuthClientEntity | null> {
    const doc = await this.oauthClientModel.findOne({
      clientId,
      clientSecret,
      isActive: true
    }).lean().exec();
    return this.toEntity(doc as any);
  }
}
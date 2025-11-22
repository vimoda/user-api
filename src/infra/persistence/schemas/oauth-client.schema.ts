import { Schema } from 'mongoose';

export const OAuthClientSchema = new Schema({
  _id: { type: String },
  clientId: { type: String, required: true, unique: true, index: true },
  clientSecret: { type: String, required: true },
  clientName: { type: String, required: true },
  clientDescription: { type: String },
  redirectUris: [{ type: String }],
  grantTypes: [{ type: String, enum: ['authorization_code', 'implicit', 'password', 'client_credentials', 'refresh_token'] }],
  scopes: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // User ID who created this client
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'oauth_clients', versionKey: false });
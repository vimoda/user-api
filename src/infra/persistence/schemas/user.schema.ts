import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  _id: { type: String },
  email: { type: String, sparse: true, index: true },
  phone: { type: String, sparse: true, index: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['user'] },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users', versionKey: false });

// Compound index to ensure uniqueness of email when not null
UserSchema.index({ email: 1 }, { unique: true, sparse: true, partialFilterExpression: { email: { $exists: true, $ne: null } } });

// Compound index to ensure uniqueness of phone when not null
UserSchema.index({ phone: 1 }, { unique: true, sparse: true, partialFilterExpression: { phone: { $exists: true, $ne: null } } });

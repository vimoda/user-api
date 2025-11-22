import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';

interface UserDoc {
  _id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  roles: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(@InjectModel('User') private userModel: Model<UserDoc>) {}

  private toEntity(doc: UserDoc | null): UserEntity | null {
    if (!doc) return null;
    return new UserEntity(
      doc._id,
      doc.email,
      doc.phone,
      doc.passwordHash,
      doc.roles,
      doc.isEmailVerified,
      doc.isPhoneVerified,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const doc = new this.userModel({
      _id: user.id,
      email: user.email,
      phone: user.phone,
      passwordHash: user.passwordHash,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    await doc.save();
    return this.toEntity(doc)!;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).lean().exec();
    return this.toEntity(doc as any);
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ phone }).lean().exec();
    return this.toEntity(doc as any);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findById(id).lean().exec();
    return this.toEntity(doc as any);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    await this.userModel.updateOne({ _id: user.id }, {
      $set: {
        email: user.email,
        phone: user.phone,
        passwordHash: user.passwordHash,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        updatedAt: new Date()
      }
    }).exec();
    return this.findById(user.id) as Promise<UserEntity>;
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    try {
      // Use findOneAndUpdate to atomically set the refresh token and return the document
      const updated = await this.userModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            refreshToken,
            refreshTokenExpiresAt: expiresAt,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      ).lean().exec();

      if (!updated) {
        throw new Error(`User with ID ${userId} not found`);
      }
    } catch (error) {
      console.error('[UserRepositoryAdapter] Error updating refresh token:', error);
      throw new Error(`Failed to update refresh token: ${(error as Error).message}`);
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ refreshToken }).lean().exec();
    return this.toEntity(doc as any);
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, {
      $unset: {
        refreshToken: 1,
        refreshTokenExpiresAt: 1
      },
      $set: {
        updatedAt: new Date()
      }
    }).exec();
  }
}

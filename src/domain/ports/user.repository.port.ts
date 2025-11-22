import { UserEntity } from '../../domain/entities/user.entity';

export interface UserRepositoryPort {
  create(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  update(user: UserEntity): Promise<UserEntity>;
  updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<UserEntity | null>;
  removeRefreshToken(userId: string): Promise<void>;
}

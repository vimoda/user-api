import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

export interface FindUserByIdResult {
  id: string;
  email: string | null;
  phone: string | null;
  roles: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
}

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(id: string): Promise<FindUserByIdResult> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt
    };
  }
}
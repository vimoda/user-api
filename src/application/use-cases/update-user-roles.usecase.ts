import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';

export interface UpdateUserRolesInput {
  userId: string;
  roles: string[];
}

@Injectable()
export class UpdateUserRolesUseCase {
  constructor(
    @Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(input: UpdateUserRolesInput): Promise<UserEntity> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = user.update({
      roles: input.roles
    });

    return this.userRepository.update(updatedUser);
  }
}
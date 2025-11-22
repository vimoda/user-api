import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { AuthServicePort } from '../../domain/ports/auth.service.port';
import { EmailVO } from '../../domain/value-objects/email.vo';
import { PasswordVO } from '../../domain/value-objects/password.vo';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { randomUUID } from 'crypto';
import { UserAlreadyExistsException } from '../../infra/http/exceptions/business.exceptions';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepositoryPort') private readonly usersRepo: UserRepositoryPort,
    @Inject('AuthServicePort') private readonly auth: AuthServicePort
  ) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const password = new PasswordVO(dto.password);

    // Validate uniqueness based on provided fields
    if (dto.email) {
      const email = new EmailVO(dto.email);
      const existing = await this.usersRepo.findByEmail(email.value);
      if (existing) throw new UserAlreadyExistsException(email.value);
    }
    if (dto.phone) {
      const existing = await this.usersRepo.findByPhone(dto.phone);
      if (existing) throw new UserAlreadyExistsException(dto.phone);
    }

    const hash = await this.auth.hashPassword(password.value);

    const user = UserEntity.create({
      id: randomUUID(),
      email: dto.email,
      phone: dto.phone,
      passwordHash: hash,
      roles: ['user']
    });

    return this.usersRepo.create(user);
  }
}

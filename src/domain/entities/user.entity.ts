export class UserEntity {
  constructor(
    readonly id: string,
    readonly email: string | null,
    readonly phone: string | null,
    readonly passwordHash: string,
    readonly roles: string[] = ['user'],
    readonly isEmailVerified: boolean = false,
    readonly isPhoneVerified: boolean = false,
    readonly createdAt: Date = new Date(),
    readonly updatedAt: Date = new Date()
  ) {}

  static create(params: {
    id: string;
    email?: string;
    phone?: string;
    passwordHash: string;
    roles?: string[];
  }): UserEntity {
    return new UserEntity(
      params.id,
      params.email || null,
      params.phone || null,
      params.passwordHash,
      params.roles || ['user'],
      false, // isEmailVerified
      false, // isPhoneVerified
      new Date(),
      new Date()
    );
  }

  update(params: {
    email?: string;
    phone?: string;
    roles?: string[];
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  }): UserEntity {
    return new UserEntity(
      this.id,
      params.email !== undefined ? params.email : this.email,
      params.phone !== undefined ? params.phone : this.phone,
      this.passwordHash,
      params.roles !== undefined ? params.roles : this.roles,
      params.isEmailVerified !== undefined ? params.isEmailVerified : this.isEmailVerified,
      params.isPhoneVerified !== undefined ? params.isPhoneVerified : this.isPhoneVerified,
      this.createdAt,
      new Date()
    );
  }
}

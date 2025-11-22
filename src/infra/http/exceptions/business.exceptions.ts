import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

export class UserAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}

export class UserNotFoundException extends BusinessException {
  constructor(id: string) {
    super(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidTokenException extends BusinessException {
  constructor() {
    super('Invalid or expired token', HttpStatus.UNAUTHORIZED);
  }
}
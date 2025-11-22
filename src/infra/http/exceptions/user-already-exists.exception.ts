import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `User with email ${email} already exists`,
        error: 'Conflict'
      },
      HttpStatus.CONFLICT
    );
  }
}
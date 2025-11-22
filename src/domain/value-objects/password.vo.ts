export class PasswordVO {
  readonly value: string;

  constructor(password: string) {
    if (!password || password.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    this.value = password;
  }
}

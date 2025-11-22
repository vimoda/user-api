export class EmailVO {
  readonly value: string;

  constructor(email: string) {
    if (!email) throw new Error('EMAIL_REQUIRED');
    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) throw new Error('EMAIL_INVALID');
    this.value = cleaned;
  }
}

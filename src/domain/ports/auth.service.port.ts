export interface AuthServicePort {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(userId: string, roles: string[], realm?: string): Promise<string>;
  verifyToken<T = any>(token: string): Promise<T>;
  generateRefreshToken(userId: string, realm?: string): Promise<string>;
  verifyRefreshToken<T = any>(token: string): Promise<T>;
  getTokenExpiration(token: string): Promise<Date>;
  getRefreshTokenExpiration(token: string): Promise<Date>;
}

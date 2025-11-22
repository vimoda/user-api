import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RealmConfig {
  name: string;
  issuer: string;
  audience: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  privateKeyPath: string;
  publicKeyPath: string;
}

@Injectable()
export class RealmService {
  private realms: Map<string, RealmConfig>;

  constructor(private configService: ConfigService) {
    this.realms = new Map();
    this.loadRealms();
  }

  private loadRealms() {
    const realmsConfig = this.configService.get('realms') || {};
    Object.entries(realmsConfig).forEach(([key, config]) => {
      this.realms.set(key, config as RealmConfig);
    });
  }

  getRealm(realmName: string = 'default'): RealmConfig {
    const realm = this.realms.get(realmName);
    if (!realm) {
      throw new Error(`Realm '${realmName}' not found`);
    }
    return realm;
  }

  getAllRealms(): RealmConfig[] {
    return Array.from(this.realms.values());
  }

  addRealm(name: string, config: RealmConfig) {
    this.realms.set(name, { ...config, name });
  }

  updateRealm(name: string, config: Partial<RealmConfig>) {
    const existing = this.realms.get(name);
    if (!existing) {
      throw new Error(`Realm '${name}' not found`);
    }
    this.realms.set(name, { ...existing, ...config });
  }

  deleteRealm(name: string) {
    if (name === 'default') {
      throw new Error('Cannot delete default realm');
    }
    return this.realms.delete(name);
  }
}
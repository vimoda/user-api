import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from './http/http.module';

@Module({
  imports: [PersistenceModule, AuthModule, HttpModule],
  exports: [PersistenceModule, AuthModule, HttpModule]
})
export class InfraModule {}

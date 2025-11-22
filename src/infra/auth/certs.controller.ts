import { Controller, Get } from '@nestjs/common';
import { CertsService } from './certs.service';

@Controller('protocol/openid-connect/certs')
export class CertsController {
  constructor(private readonly certsService: CertsService) {}

  @Get()
  async getCerts() {
    return this.certsService.getPublicKeyJWK();
  }
}
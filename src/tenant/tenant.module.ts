import { Module } from '@nestjs/common';
import { TenantMiddleware } from './tenant.middleware.js';

@Module({
  providers: [TenantMiddleware],
  exports: [TenantMiddleware],
})
export class TenantModule {}

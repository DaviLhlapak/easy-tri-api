import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  type NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DbModule } from './db/db.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { TenantMiddleware } from './tenant/tenant.middleware.js';
import { TenantModule } from './tenant/tenant.module.js';
import { TriagesModule } from './triages/triages.module.js';

@Module({
  imports: [DbModule, TenantModule, AuthModule, PatientsModule, TriagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: '/', method: RequestMethod.GET })
      .forRoutes('*');
  }
}

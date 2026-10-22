import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DoctorsController } from './doctors.controller.js';
import { DoctorsService } from './doctors.service.js';

@Module({
  imports: [AuthModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}

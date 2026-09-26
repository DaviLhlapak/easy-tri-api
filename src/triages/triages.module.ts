import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TriagesController } from './triages.controller.js';
import { TriagesService } from './triages.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TriagesController],
  providers: [TriagesService],
})
export class TriagesModule {}

import { Module } from '@nestjs/common';
import { QualityCheckService } from './quality-check.service';
import { QualityCheckController } from './quality-check.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QualityCheckController],
  providers: [QualityCheckService],
  exports: [QualityCheckService],
})
export class QualityCheckModule {}

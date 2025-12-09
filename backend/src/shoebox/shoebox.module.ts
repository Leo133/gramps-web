import { Module } from '@nestjs/common';
import { ShoeboxService } from './shoebox.service';
import { ShoeboxController } from './shoebox.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShoeboxController],
  providers: [ShoeboxService],
  exports: [ShoeboxService],
})
export class ShoeboxModule {}

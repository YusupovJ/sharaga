import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/services/prisma.service';
import { DormitoryController } from './dormitory.controller';
import { DormitoryService } from './dormitory.service';

@Module({
  controllers: [DormitoryController],
  providers: [DormitoryService, PrismaService, JwtService],
})
export class DormitoryModule {}

import { Module } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { DormitoryModule } from './dormitory/dormitory.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [AuthModule, StudentsModule, DormitoryModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

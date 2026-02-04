import { Module } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

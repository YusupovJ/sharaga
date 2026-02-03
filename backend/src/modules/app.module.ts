import { Module } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";

@Module({
  imports: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

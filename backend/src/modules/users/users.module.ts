import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/common/services/prisma.service";
import { UsersController } from "./users.controller";

@Module({
  controllers: [UsersController],
  providers: [PrismaService, JwtService],
})
export class UsersModule {}

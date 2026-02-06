import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/common/services/prisma.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [PrismaService, JwtService, UsersService],
  exports: [UsersService],
})
export class UsersModule {}

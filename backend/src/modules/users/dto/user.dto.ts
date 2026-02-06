import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "generated/prisma/enums";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  passport: string;

  @IsString()
  @IsNotEmpty()
  faculty: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @IsOptional()
  job?: string;

  @IsNumber()
  @IsOptional()
  dormitoryId?: number;
}

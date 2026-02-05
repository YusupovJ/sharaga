import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AssignStudentDto {
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @IsOptional()
  @IsString()
  job?: string;

  @IsNotEmpty()
  @IsNumber()
  dormitoryId: number;
}

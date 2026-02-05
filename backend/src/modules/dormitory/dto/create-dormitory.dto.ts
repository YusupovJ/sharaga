import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDormitoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}

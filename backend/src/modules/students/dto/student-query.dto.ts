import { IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class StudentQueryDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  dormitoryId?: number;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  passport?: string;

  @IsOptional()
  @IsString()
  faculty?: string;
}

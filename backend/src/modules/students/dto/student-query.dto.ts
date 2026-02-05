import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class StudentQueryDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  dormitoryId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  order?: "asc" | "desc";
}

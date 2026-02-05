import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class GetTodayAttendanceDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  dormitoryId?: number;
}

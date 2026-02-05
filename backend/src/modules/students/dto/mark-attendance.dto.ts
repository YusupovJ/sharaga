import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

export class AttendanceRecordDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @IsNotEmpty()
  @IsBoolean()
  isPresent: boolean;
}

export class BulkAttendanceDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}

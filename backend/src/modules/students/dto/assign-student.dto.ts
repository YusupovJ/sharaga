import { IsNotEmpty, IsNumber } from "class-validator";

export class AssignStudentDto {
  @IsNotEmpty()
  @IsNumber()
  dormitoryId: number;
}

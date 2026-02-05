import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import type { Response as ExpressResponse } from "express";
import { UserRole } from "generated/prisma/enums";
import { Roles } from "src/common/decorators/roles.decorator";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import type { IPayload } from "src/common/types";
import { AssignStudentDto } from "./dto/assign-student.dto";
import { CreateStudentDto } from "./dto/create-student.dto";
import { GetMonthAttendanceDto } from "./dto/get-month-attendance.dto";
import { GetTodayAttendanceDto } from "./dto/get-today-attendance.dto";
import { BulkAttendanceDto } from "./dto/mark-attendance.dto";
import { StudentQueryDto } from "./dto/student-query.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";

@Roles(UserRole.admin, UserRole.moderator)
@UseGuards(RolesGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(@CurrentUser() user: IPayload, @Query() query: StudentQueryDto) {
    return this.studentsService.findAll(user, query);
  }

  @Get("search-global")
  searchGlobal(@Query("passport") passport: string) {
    return this.studentsService.searchGlobal(passport);
  }

  @Get(":id/attendance/month")
  getMonthAttendance(@Param("id") id: string, @Query() query: GetMonthAttendanceDto) {
    return this.studentsService.getMonthAttendance(+id, query);
  }

  @Get(":id/attendance/export")
  async exportAttendance(@Param("id") id: string, @Res() res: ExpressResponse) {
    const { buffer, fileName } = await this.studentsService.getStudentAttendanceExcel(+id);

    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    res.send(buffer);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Patch(":id/room-job")
  updateRoomJob(@Param("id") id: string, @Body() dto: { roomNumber?: string; job?: string }) {
    return this.studentsService.updateRoomJob(+id, dto);
  }

  @Patch(":id/assign")
  assign(@Param("id") id: string, @Body() dto: AssignStudentDto) {
    return this.studentsService.assignDormitory(+id, dto);
  }

  @Roles(UserRole.admin)
  @Patch(":id/unassign")
  unassign(@Param("id") id: string) {
    return this.studentsService.unassignDormitory(+id);
  }

  @Get("attendance/today")
  getTodayAttendance(@CurrentUser() user: IPayload, @Query() query: GetTodayAttendanceDto) {
    return this.studentsService.getTodayAttendance(user, query);
  }

  @Post("attendance/bulk")
  bulkAttendance(@CurrentUser() user: IPayload, @Body() dto: BulkAttendanceDto) {
    return this.studentsService.bulkAttendance(user, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.studentsService.remove(+id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "generated/prisma/enums";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import { DormitoryService } from "./dormitory.service";
import { CreateDormitoryDto } from "./dto/create-dormitory.dto";
import { UpdateDormitoryDto } from "./dto/update-dormitory.dto";

@Controller("dormitory")
@Roles(UserRole.admin, UserRole.superAdmin)
@UseGuards(RolesGuard)
export class DormitoryController {
  constructor(private readonly dormitoryService: DormitoryService) {}

  @Post()
  create(@Body() createDormitoryDto: CreateDormitoryDto) {
    return this.dormitoryService.create(createDormitoryDto);
  }

  @Get()
  findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
    @Query("sort") sort: string = "createdAt",
    @Query("order") order: "asc" | "desc" = "desc",
  ) {
    return this.dormitoryService.findAll(+page, +limit, search, sort, order);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dormitoryService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDormitoryDto: UpdateDormitoryDto) {
    return this.dormitoryService.update(+id, updateDormitoryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.dormitoryService.remove(+id);
  }
}

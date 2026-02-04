import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import type { IPayload } from "src/common/types";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post("logout")
  @Roles("admin", "moderator")
  @UseGuards(RolesGuard)
  logout(@CurrentUser() user: IPayload) {
    return this.authService.logout(user.id);
  }
}

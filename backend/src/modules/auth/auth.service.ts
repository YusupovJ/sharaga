import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compareSync } from "bcrypt";
import { envConfig } from "src/common/config/env.config";
import { PrismaService } from "src/common/services/prisma.service";
import { IPayload } from "src/common/types";
import { LoginDto, RefreshDto } from "./dto/auth.dto";
import { UserRole } from "generated/prisma/enums";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { login, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { login },
      include: {
        dormitory: true
      }
    });

    if (!user) {
      throw new NotFoundException("Login yoki parol xato");
    }

    if (!compareSync(password, user.password)) {
      throw new NotFoundException("Login yoki parol xato");
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.role);

    await this.prisma.user.update({
      data: { token: refreshToken },
      where: { id: user.id },
    });

    return {
      id: user.id,
      role: user.role,
      dormId: user.role === UserRole.moderator ? user.dormitory?.[0]?.id : undefined,
      accessToken,
      refreshToken,
    };
  }

  async refresh({ token }: RefreshDto) {
    try {
      const payload: IPayload = this.jwt.verify(token, {
        secret: envConfig.secretKey,
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        include: { dormitory: true }
      });

      if (!user || user.token !== token) {
        throw new UnauthorizedException("Refresh token noto'g'ri yoki muddati o'tgan");
      }

      const tokens = this.generateTokens(user.id, user.role);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { token: tokens.refreshToken },
      });

      return {
        ...tokens,
        id: user.id,
        dormId: user.role === UserRole.moderator ? user.dormitory?.[0]?.id : undefined,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException("Token yaroqsiz");
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { token: null },
    });

    return "success";
  }

  private generateTokens(id: number, role: UserRole) {
    return {
      accessToken: this.jwt.sign({ id, role }, { expiresIn: "15m", secret: envConfig.secretKey }),
      refreshToken: this.jwt.sign({ id, role }, { expiresIn: "15d", secret: envConfig.secretKey }),
    };
  }
}

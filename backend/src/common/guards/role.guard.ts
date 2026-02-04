import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "generated/prisma/enums";
import { envConfig } from "../config/env.config";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IPayload, IRequest } from "../types";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
        return true;
      }

      const request: IRequest = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(" ")?.[1];

      if (!token) {
        throw new ForbiddenException("No token");
      }

      const payload: IPayload = this.jwt.verify(token, {
        secret: envConfig.secretKey,
      });
      const hasRole = requiredRoles.some((role) => payload.role === role);

      if (!hasRole) {
        throw new ForbiddenException("No rights");
      }

      request.user = payload;

      return true;
    } catch (err) {
      console.log(err);
      throw new ForbiddenException("Sizda ushbu harakat uchun huquq yo'q");
    }
  }
}

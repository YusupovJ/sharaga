import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IPayload } from "../types";

export const CurrentUser = createParamDecorator<IPayload>((_, ctx: ExecutionContext): IPayload => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as IPayload;

  return user;
});

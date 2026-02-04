import { Request } from "express";
import { UserRole } from "generated/prisma/enums";

export interface IPayload {
  id: number;
  role: UserRole;
}

export interface IRequest extends Request {
  user: IPayload;
}

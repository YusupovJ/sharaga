import { UserRole } from "generated/prisma/enums";

export interface IPayload {
  id: number;
  role: UserRole;
}

import type { User } from "@prisma/client";
import { UserRole } from "@prisma/client";

export { UserRole };

export interface GetCurrentUserResponse {
  data: User;
}

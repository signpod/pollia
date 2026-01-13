import type { User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export { UserRole };

export interface EnsureUserExistsOptions {
  user: SupabaseUser;
  name?: string;
  phone?: string;
}

export interface GetCurrentUserResponse {
  data: User;
}

import type { User, UserRole } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type { UserRole };

export interface EnsureUserExistsOptions {
  user: SupabaseUser;
  name?: string;
  phone?: string;
}

export interface GetCurrentUserResponse {
  data: User;
}

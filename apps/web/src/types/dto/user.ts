import { UserRole } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export { UserRole };

export interface EnsureUserExistsOptions {
  user: SupabaseUser;
  name?: string;
}

export interface GetCurrentUserResponse {
  data: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
}

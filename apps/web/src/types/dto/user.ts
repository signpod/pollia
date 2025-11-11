import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface EnsureUserExistsOptions {
  user: SupabaseUser;
  name?: string;
}

export interface GetCurrentUserResponse {
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface EnsureUserExistsOptions {
  user: SupabaseUser;
  name?: string;
}

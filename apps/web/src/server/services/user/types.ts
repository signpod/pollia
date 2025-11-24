import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface CreateUserIfNotExistsInput {
  user: SupabaseUser;
  name?: string;
}

export interface CreateUserData {
  id: string;
  email: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
}

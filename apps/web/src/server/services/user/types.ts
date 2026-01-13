import type { Prisma } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface CreateUserIfNotExistsInput {
  user: SupabaseUser;
  name?: string;
  phone?: string;
}

export type CreateUserData = Prisma.UserCreateInput;

export type UpdateUserInput = Prisma.UserUpdateInput;

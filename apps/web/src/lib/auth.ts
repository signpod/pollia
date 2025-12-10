import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    isAuthenticated: !!user,
    user,
  };
}

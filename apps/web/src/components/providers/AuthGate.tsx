import { redirect } from "next/navigation";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";

interface AuthGateProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function AuthGate({ children, redirectTo = "/login" }: AuthGateProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}

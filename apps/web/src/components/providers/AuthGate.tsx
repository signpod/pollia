import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { redirect } from "next/navigation";

interface AuthGateProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function AuthGate({
  children,
  redirectTo = "/login",
}: AuthGateProps) {
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

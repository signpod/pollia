import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { redirect } from "next/navigation";

interface AuthGateProps {
  children: React.ReactNode;
  redirectTo?: string;
  currentPath?: string;
}

export async function AuthGate({ children, redirectTo = "/login", currentPath }: AuthGateProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const redirectUrl = currentPath
      ? `${redirectTo}?next=${encodeURIComponent(currentPath)}`
      : redirectTo;

    redirect(redirectUrl);
  }

  return <>{children}</>;
}

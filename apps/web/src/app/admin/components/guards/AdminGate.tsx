import { requireAdmin } from "@/actions/common/auth";
import { ROUTES } from "@/constants/routes";
import { notFound, redirect } from "next/navigation";

interface AdminGateProps {
  children: React.ReactNode;
}

export async function AdminGate({ children }: AdminGateProps) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error) {
      if (error.cause === 401) {
        redirect(ROUTES.ADMIN_LOGIN);
      }
      if (error.cause === 403) {
        notFound();
      }
    }
    throw error;
  }

  return <>{children}</>;
}

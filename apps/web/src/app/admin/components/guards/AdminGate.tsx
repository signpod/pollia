import { requireAdmin } from "@/actions/common/auth";
import { ROUTES } from "@/constants/routes";
import { notFound, redirect } from "next/navigation";

interface AdminGateProps {
  children: React.ReactNode;
}

/**
 * 관리자 권한 확인 게이트
 * Admin이 아닌 경우 404로 처리
 */
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

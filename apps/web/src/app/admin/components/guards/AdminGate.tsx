import { requireAdmin } from "@/actions/common/auth";
import { notFound } from "next/navigation";

interface AdminGateProps {
  children: React.ReactNode;
}

export async function AdminGate({ children }: AdminGateProps) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error) {
      if (error.cause === 401) {
        console.warn("[AdminGate] 401 Unauthorized - 로그인 필요:", error.message);
        notFound();
      }
      if (error.cause === 403) {
        console.warn("[AdminGate] 403 Forbidden - 관리자 권한 없음:", error.message);
        notFound();
      }
      if (error.cause === 404) {
        console.warn("[AdminGate] 404 Not Found - 사용자 정보 없음:", error.message);
        notFound();
      }
    }
    throw error;
  }

  return <>{children}</>;
}

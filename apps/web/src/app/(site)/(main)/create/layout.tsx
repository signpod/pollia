import { requireActiveUser } from "@/actions/common/auth";
import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";

export default async function CreateLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireActiveUser();
  } catch (error) {
    const isUnauth = error instanceof Error && error.cause === 401;
    const isForbidden = error instanceof Error && error.cause === 403;
    if (isUnauth || isForbidden) {
      redirect(ROUTES.LOGIN);
    }
    throw error;
  }
  return <>{children}</>;
}

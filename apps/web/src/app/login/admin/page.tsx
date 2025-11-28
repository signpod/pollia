import { requireAdmin } from "@/actions/common/auth";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { getAuthError } from "@/lib/getAuthError";
import { redirect } from "next/navigation";
import { AdminLoginClient } from "./AdminLoginClient";

export default async function AdminLoginPage() {
  const isAdmin = await requireAdmin()
    .then(() => true)
    .catch(() => false);

  if (isAdmin) {
    redirect(ADMIN_ROUTES.ADMIN);
  }

  const authError = await getAuthError();
  return <AdminLoginClient initialError={authError} />;
}

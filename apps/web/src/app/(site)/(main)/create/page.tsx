import { checkAuthStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateMissionClient } from "./CreateMissionClient";

export default async function CreateMissionPage() {
  const { isAuthenticated } = await checkAuthStatus().catch(() => ({
    isAuthenticated: false,
    user: null,
  }));

  if (!isAuthenticated) {
    redirect("/login?next=/create");
  }

  return <CreateMissionClient />;
}

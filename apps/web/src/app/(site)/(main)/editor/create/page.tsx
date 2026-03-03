import { checkAuthStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateMissionClient } from "../../create/CreateMissionClient";

export default async function EditorCreateMissionPage() {
  const { isAuthenticated } = await checkAuthStatus().catch(() => ({
    isAuthenticated: false,
    user: null,
  }));

  if (!isAuthenticated) {
    redirect("/login?next=/editor/create");
  }

  return <CreateMissionClient />;
}

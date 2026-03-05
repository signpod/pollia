import { checkAuthStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditorCreateContent } from "../components/view/EditorCreateContent";

export default async function EditorCreateMissionPage() {
  const { isAuthenticated } = await checkAuthStatus().catch(() => ({
    isAuthenticated: false,
    user: null,
  }));

  if (!isAuthenticated) {
    redirect("/login?next=/editor/create");
  }

  return <EditorCreateContent />;
}

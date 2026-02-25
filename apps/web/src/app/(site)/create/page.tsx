import Providers from "@/components/providers/QueryProvider";
import { checkAuthStatus } from "@/lib/auth";
import { ModalProvider } from "@repo/ui/components";
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

  return (
    <ModalProvider>
      <Providers>
        <CreateMissionClient />
      </Providers>
    </ModalProvider>
  );
}

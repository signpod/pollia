import { AuthGate } from "@/components/providers/AuthGate";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import Providers from "@/components/providers/QueryProvider";
import { ROUTES } from "@/constants/routes";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { MeLayoutShell } from "./components/MeLayoutShell";

export const dynamic = "force-dynamic";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <NetworkStatusProvider>
        <AuthGate currentPath={ROUTES.ME}>
          <Providers>
            <MeLayoutShell>{children}</MeLayoutShell>
            <Toaster />
          </Providers>
        </AuthGate>
      </NetworkStatusProvider>
    </ModalProvider>
  );
}

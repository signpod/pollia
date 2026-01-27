import { AuthGate } from "@/components/providers/AuthGate";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import Providers from "@/components/providers/QueryProvider";
import { ROUTES } from "@/constants/routes";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { MeFooter, MeHeader } from "./components";

export const dynamic = "force-dynamic";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <NetworkStatusProvider>
        <AuthGate currentPath={ROUTES.ME}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <MeHeader />
              <div className="flex flex-col flex-1">{children}</div>
              <div className="h-px w-full bg-zinc-100" />
              <MeFooter />
            </div>
            <Toaster />
          </Providers>
        </AuthGate>
      </NetworkStatusProvider>
    </ModalProvider>
  );
}

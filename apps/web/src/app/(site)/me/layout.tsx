import { AuthGate } from "@/components/providers/AuthGate";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import Providers from "@/components/providers/QueryProvider";
import { ROUTES } from "@/constants/routes";
import { FixedBottomLayout, ModalProvider, Toaster } from "@repo/ui/components";
import { BottomNavBar, Header } from "../(main)/components";
import { MeLayoutShell } from "./components/MeLayoutShell";

export const dynamic = "force-dynamic";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <NetworkStatusProvider>
        <AuthGate currentPath={ROUTES.ME}>
          <Providers>
            <FixedBottomLayout hasGradientBlur>
              <div className="fixed top-0 left-0 right-0 z-[100] mx-auto max-w-[600px] bg-white">
                <Header />
              </div>
              <div className="pt-12">
                <MeLayoutShell>{children}</MeLayoutShell>
              </div>
              <Toaster />
              <FixedBottomLayout.Content className="px-0">
                <BottomNavBar />
              </FixedBottomLayout.Content>
            </FixedBottomLayout>
          </Providers>
        </AuthGate>
      </NetworkStatusProvider>
    </ModalProvider>
  );
}

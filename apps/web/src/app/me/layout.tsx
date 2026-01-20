import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ROUTES } from "@/constants/routes";
import { FixedBottomLayout } from "@repo/ui/components";
import { MeFooter, MeHeader } from "./components";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate currentPath={ROUTES.ME}>
      <Providers>
        <FixedBottomLayout className="bg-background min-h-screen">
          <MeHeader />
          {children}
          <div className="h-px w-full bg-zinc-100" />
          <MeFooter />
        </FixedBottomLayout>
      </Providers>
    </AuthGate>
  );
}

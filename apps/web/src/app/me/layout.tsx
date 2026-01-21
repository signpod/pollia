import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ROUTES } from "@/constants/routes";
import { MeFooter, MeHeader } from "./components";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate currentPath={ROUTES.ME}>
      <Providers>
        <div className="flex flex-col min-h-screen">
          <MeHeader />
          <div className="flex flex-col flex-1">{children}</div>
          <div className="h-px w-full bg-zinc-100" />
          <MeFooter />
        </div>
      </Providers>
    </AuthGate>
  );
}

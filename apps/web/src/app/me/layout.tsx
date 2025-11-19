import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ROUTES } from "@/constants/routes";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate currentPath={ROUTES.ME}>
      <Providers>{children}</Providers>
    </AuthGate>
  );
}

import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ModalProvider } from "@repo/ui/components";

export default function ActionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <AuthGate>
        <Providers>{children}</Providers>
      </AuthGate>
    </ModalProvider>
  );
}

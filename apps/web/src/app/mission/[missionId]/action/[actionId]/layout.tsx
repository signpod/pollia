import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ModalProvider } from "@repo/ui/components";
import { ProgressBarProvider } from "./providers/ProgressBarProvider";

export default function ActionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <AuthGate>
        <Providers>
          <ProgressBarProvider>{children}</ProgressBarProvider>
        </Providers>
      </AuthGate>
    </ModalProvider>
  );
}

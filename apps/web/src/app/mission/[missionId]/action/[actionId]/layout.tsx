import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ProgressBarProvider } from "./providers/ProgressBarProvider";

export default function ActionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Providers>
        <ProgressBarProvider>{children}</ProgressBarProvider>
      </Providers>
    </AuthGate>
  );
}

import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";

export default function CreateMissionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Providers>{children}</Providers>
    </AuthGate>
  );
}

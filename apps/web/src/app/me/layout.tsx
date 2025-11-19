import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate currentPath={"/me"}>
      <Providers>{children}</Providers>
    </AuthGate>
  );
}

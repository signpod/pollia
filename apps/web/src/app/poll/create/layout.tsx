import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { BottomCTALayout } from "@repo/ui/components";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <BottomCTALayout>
        <Providers>{children}</Providers>
      </BottomCTALayout>
    </AuthGate>
  );
}

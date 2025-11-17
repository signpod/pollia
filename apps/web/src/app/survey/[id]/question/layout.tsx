import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";

export default function QuestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Providers>{children}</Providers>
    </AuthGate>
  );
}

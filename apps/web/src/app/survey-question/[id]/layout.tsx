import { AuthGate } from "@/components/providers/AuthGate";
import Providers from "@/components/providers/QueryProvider";
import { ModalProvider } from "@repo/ui/components";

export default function SurveyQuestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <AuthGate>
        <Providers>{children}</Providers>
      </AuthGate>
    </ModalProvider>
  );
}

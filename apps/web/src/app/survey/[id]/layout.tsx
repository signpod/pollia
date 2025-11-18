import Providers from "@/components/providers/QueryProvider";
import { ModalProvider } from "@repo/ui/components";
import type { PropsWithChildren } from "react";

export default function SurveyLayout({ children }: PropsWithChildren) {
  return (
    <ModalProvider>
      <Providers>{children}</Providers>
    </ModalProvider>
  );
}

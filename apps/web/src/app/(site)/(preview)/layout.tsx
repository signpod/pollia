import { AdminGate } from "@/app/admin/components/guards/AdminGate";
import Providers from "@/components/providers/QueryProvider";
import { ModalProvider } from "@repo/ui/components";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <ModalProvider>
        <Providers>{children}</Providers>
      </ModalProvider>
    </AdminGate>
  );
}

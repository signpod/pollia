import { AdminGate } from "@/app/admin/components/guards/AdminGate";
import Providers from "@/components/providers/QueryProvider";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <Providers>{children}</Providers>
    </AdminGate>
  );
}

import { AdminQueryProvider } from "@/app/admin/components/AdminQueryProvider";
import { AdminGate } from "@/app/admin/components/guards/AdminGate";
import { V2Layout } from "./components/V2Layout";

export default async function AdminV2LayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "auto" }}>
      <AdminGate>
        <AdminQueryProvider>
          <V2Layout>{children}</V2Layout>
        </AdminQueryProvider>
      </AdminGate>
    </div>
  );
}

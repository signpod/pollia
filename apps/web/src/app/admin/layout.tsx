import "./admin.css";
import { AdminLayout } from "./components/AdminLayout";
import { AdminQueryProvider } from "./components/AdminQueryProvider";
import { AdminGate } from "./components/guards/AdminGate";

export default async function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root fixed inset-0 overflow-auto">
      <AdminGate>
        <AdminQueryProvider>
          <AdminLayout>{children}</AdminLayout>
        </AdminQueryProvider>
      </AdminGate>
    </div>
  );
}

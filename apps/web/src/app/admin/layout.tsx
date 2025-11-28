import "./admin.css";
import { AdminLayout } from "./components/AdminLayout";
import { AdminGate } from "./components/guards/AdminGate";

export default async function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root fixed inset-0 overflow-auto">
      <AdminGate>
        <AdminLayout>{children}</AdminLayout>
      </AdminGate>
    </div>
  );
}

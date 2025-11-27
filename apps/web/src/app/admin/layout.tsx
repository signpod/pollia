import "./admin.css";
import { AdminGate } from "./components/guards/AdminGate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root fixed inset-0 overflow-auto">
      <AdminGate>{children}</AdminGate>
    </div>
  );
}

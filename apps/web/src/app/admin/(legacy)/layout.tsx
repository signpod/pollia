import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./admin.css";
import { AdminLayout } from "../components/AdminLayout";
import { AdminQueryProvider } from "../components/AdminQueryProvider";
import { AdminGate } from "../components/guards/AdminGate";

export default async function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <div className="admin-root fixed inset-0 overflow-auto">
        <AdminGate>
          <AdminQueryProvider>
            <AdminLayout>{children}</AdminLayout>
          </AdminQueryProvider>
        </AdminGate>
      </div>
    </AppRouterCacheProvider>
  );
}

"use client";
import { SidebarInset, SidebarProvider } from "@/app/admin/components/shadcn-ui/sidebar";
import { useAdminTheme } from "@/app/admin/hooks/use-admin-theme";
import { AdminSidebar } from "./AdminSidebar";
import { AdminSidebarTrigger } from "./AdminSidebarTrigger";
import { Toaster } from "./shadcn-ui/sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useAdminTheme();

  return (
    <SidebarProvider>
      <Toaster />
      <AdminSidebar />
      <SidebarInset>
        <AdminLayoutHeader />
        <div className="flex-1 overflow-auto p-7">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminLayoutHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
      <AdminSidebarTrigger />
      {/*TODO: 뒤로가기, 새로고침 등 버튼 추가 */}
    </header>
  );
}

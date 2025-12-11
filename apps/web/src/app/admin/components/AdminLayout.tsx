"use client";
import { SidebarInset, SidebarProvider } from "@/app/admin/components/shadcn-ui/sidebar";
import { useAdminTheme } from "@/app/admin/hooks/use-admin-theme";
import { AdminLayoutHeader } from "./AdminLayoutHeader";
import { AdminSidebar } from "./AdminSidebar";
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

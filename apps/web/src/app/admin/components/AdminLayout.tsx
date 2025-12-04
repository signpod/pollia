"use client";

import { Separator } from "@/app/admin/components/shadcn-ui/separator";
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <AdminSidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

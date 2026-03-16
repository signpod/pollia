"use client";

import { AdminSidebarTrigger } from "@/app/admin/components/AdminSidebarTrigger";
import { SidebarInset, SidebarProvider } from "@/app/admin/components/shadcn-ui/sidebar";
import { Toaster } from "@/app/admin/components/shadcn-ui/sonner";
import { V2Sidebar } from "./V2Sidebar";

interface V2LayoutProps {
  children: React.ReactNode;
}

export function V2Layout({ children }: V2LayoutProps) {
  return (
    <SidebarProvider>
      <Toaster />
      <V2Sidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
          <AdminSidebarTrigger />
        </header>
        <div className="flex-1 overflow-auto p-7">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

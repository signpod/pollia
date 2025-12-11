"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { useSidebar } from "@/app/admin/components/shadcn-ui/sidebar";
import { ChevronsLeft, PanelLeftIcon } from "lucide-react";

export function AdminSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button variant="ghost" size="icon" className="size-7 cursor-pointer" onClick={toggleSidebar}>
      {state === "expanded" ? <ChevronsLeft /> : <PanelLeftIcon />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

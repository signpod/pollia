"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { useSidebar } from "@/app/admin/components/shadcn-ui/sidebar";
import { ChevronLeftIcon, PanelLeftIcon } from "lucide-react";

export function AdminSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button variant="ghost" size="icon" className="-ml-1 size-7" onClick={toggleSidebar}>
      {state === "expanded" ? <ChevronLeftIcon /> : <PanelLeftIcon />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

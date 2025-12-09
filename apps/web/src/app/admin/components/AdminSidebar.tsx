"use client";

import { signOut } from "@/actions/common/auth";
import { Nav } from "@/app/admin/components/Nav";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/app/admin/components/shadcn-ui/sidebar";
import { createAdminNavConfig } from "@/app/admin/config/nav";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { useAdminTheme } from "@/app/admin/hooks/use-admin-theme";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAdminMissions } from "../hooks/use-admin-missions";
import { cn } from "../lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { isDark, toggleTheme, mounted } = useAdminTheme();
  const { missions } = useAdminMissions({ limit: 10 });

  const adminNavConfig = useMemo(() => {
    return createAdminNavConfig(missions);
  }, [missions]);

  const isActive = (url: string) => {
    if (url === ADMIN_ROUTES.ADMIN) {
      return pathname === ADMIN_ROUTES.ADMIN;
    }
    return pathname.startsWith(url);
  };

  const isExpanded = state === "expanded";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ADMIN_ROUTES.ADMIN} className="relative flex items-center cursor-pointer">
                <div>
                  <PolliaIcon
                    className={cn(
                      "shrink-0",
                      isExpanded ? "size-6" : "size-8",
                      "transition-size duration-300",
                    )}
                  />
                </div>
                <div className="flex items-end left-10 text-left text-sm leading-tight">
                  <PolliaWordmark className="h-6 w-auto" />
                  <p className="text-xs ml-1 mt-1">admin</p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <Nav config={adminNavConfig} isActive={isActive} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={mounted ? (isDark ? "라이트 모드로 전환" : "다크 모드로 전환") : "테마 전환"}
              onClick={toggleTheme}
              disabled={!mounted}
              className="w-full justify-start cursor-pointer"
            >
              {mounted ? (
                isDark ? (
                  <Moon className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )
              ) : (
                <Sun className="size-4" />
              )}
              <div className="flex-1 flex justify-between items-center">
                <span>{mounted ? (isDark ? "다크 모드" : "라이트 모드") : "테마 전환"}</span>
                <div
                  className={cn(
                    "group-data-[collapsible=icon]:hidden inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent p-px shadow-xs",
                    mounted && isDark ? "bg-primary" : "bg-input",
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full transition-transform",
                      mounted && isDark
                        ? "translate-x-4 bg-primary-foreground"
                        : "translate-x-0 bg-background",
                    )}
                  />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="로그아웃">
              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer"
                onClick={() => signOut(ADMIN_ROUTES.ADMIN_LOGIN)}
              >
                <LogOut />
                <span>로그아웃</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

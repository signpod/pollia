"use client";

import { signOut } from "@/actions/common/auth";
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
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { ArrowLeft, Image, LogOut, ScrollText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_V2_ROUTES } from "../constants/routes";

const NAV_ITEMS = [
  { title: "유저 관리", href: ADMIN_V2_ROUTES.USERS, icon: Users },
  { title: "콘텐츠 관리", href: ADMIN_V2_ROUTES.CONTENTS, icon: ScrollText },
  { title: "배너 관리", href: ADMIN_V2_ROUTES.BANNERS, icon: Image },
] as const;

export function V2Sidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href={ADMIN_V2_ROUTES.HOME}
                className="relative flex items-center cursor-pointer"
              >
                <div>
                  <PolliaIcon
                    className={`shrink-0 ${isExpanded ? "size-6" : "size-8"} transition-size duration-300`}
                  />
                </div>
                <div className="flex items-end left-10 text-left text-sm leading-tight">
                  <PolliaWordmark className="h-6 w-auto" />
                  <p className="text-xs ml-1 mt-1">v2</p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="p-2 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="기존 Admin">
              <Link href={ADMIN_ROUTES.ADMIN}>
                <ArrowLeft />
                <span>기존 Admin</span>
              </Link>
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

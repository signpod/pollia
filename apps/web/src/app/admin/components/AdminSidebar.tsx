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
import { SurveyItem, createAdminNavConfig } from "@/app/admin/config/nav";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { cn } from "../lib/utils";

//TODO: 설문 목록 조회 API 연동 후 삭제
function getMockSurveys(): SurveyItem[] {
  return [
    { id: "1", title: "사용자 만족도 조사" },
    { id: "2", title: "제품 피드백 설문" },
    { id: "3", title: "서비스 개선 의견" },
    { id: "4", title: "이벤트 참여 설문" },
  ];
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const adminNavConfig = useMemo(() => {
    const mockSurveys = getMockSurveys();
    return createAdminNavConfig(mockSurveys);
  }, []);

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
                      "text-zinc-800 shrink-0",
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

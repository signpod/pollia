"use client";

import { signOut } from "@/actions/common/auth";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import styled from "@emotion/styled";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { ArrowLeft, Image, LogOut, ScrollText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_V2_ROUTES } from "../constants/routes";
import {
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarPanel,
  useSidebarState,
} from "./ui/Sidebar";
import { color, fontSize, transition } from "./ui/tokens";

const NAV_ITEMS = [
  { title: "유저 관리", href: ADMIN_V2_ROUTES.USERS, icon: Users },
  { title: "콘텐츠 관리", href: ADMIN_V2_ROUTES.CONTENTS, icon: ScrollText },
  { title: "배너 관리", href: ADMIN_V2_ROUTES.BANNERS, icon: Image },
] as const;

export function V2Sidebar() {
  const pathname = usePathname();
  const { expanded } = useSidebarState();

  return (
    <SidebarPanel>
      <SidebarHeader>
        <LogoLink href={ADMIN_V2_ROUTES.HOME}>
          <PolliaIcon
            style={{
              width: expanded ? 24 : 28,
              height: expanded ? 24 : 28,
              flexShrink: 0,
              transition: `all ${transition.normal}`,
            }}
          />
          {expanded && (
            <LogoText>
              <PolliaWordmark style={{ height: 24, width: "auto" }} />
              <VersionTag>v2</VersionTag>
            </LogoText>
          )}
        </LogoLink>
      </SidebarHeader>

      <SidebarBody>
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <SidebarNavItem
              icon={<item.icon />}
              label={item.title}
              active={pathname.startsWith(item.href)}
              expanded={expanded}
            />
          </Link>
        ))}
      </SidebarBody>

      <SidebarFooter>
        <Link href={ADMIN_ROUTES.ADMIN} style={{ textDecoration: "none" }}>
          <SidebarNavItem icon={<ArrowLeft />} label="기존 Admin" expanded={expanded} />
        </Link>
        <div onClick={() => signOut(ADMIN_ROUTES.ADMIN_LOGIN)} style={{ cursor: "pointer" }}>
          <SidebarNavItem icon={<LogOut />} label="로그아웃" expanded={expanded} />
        </div>
      </SidebarFooter>
    </SidebarPanel>
  );
}

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 4px;
`;

const LogoText = styled.div`
  display: flex;
  align-items: flex-end;
`;

const VersionTag = styled.span`
  font-size: ${fontSize.xs};
  color: ${color.gray400};
  margin-left: 4px;
  margin-bottom: 2px;
`;

"use client";

import { AppHeader } from "@/components/common/AppHeader";

const navLinks = [
  // { href: "/", label: "홈" },
  // { href: "/missions", label: "프로젝트" },
  // { href: "/festivals", label: "지역축제" },
  { href: "/me", label: "내 정보" },
];

export function Header() {
  return <AppHeader variant="main" navLinks={navLinks} showAuth />;
}

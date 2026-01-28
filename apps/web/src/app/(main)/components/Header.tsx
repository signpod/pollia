"use client";

import { AppHeader } from "@/components/common/AppHeader";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/user";

export function Header() {
  const { data: currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser;

  const navLinks = isLoggedIn ? [{ href: ROUTES.ME, label: "마이페이지" }] : [];

  return <AppHeader variant="main" navLinks={navLinks} showAuth />;
}

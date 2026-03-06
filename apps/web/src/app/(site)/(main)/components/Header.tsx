"use client";

import { ProfileHeader } from "@/components/common/ProfileHeader";
import { ButtonV2, Typo, useDrawer } from "@repo/ui/components";
import { usePathname } from "next/navigation";
import { LoginDrawer } from "./LoginDrawer";

function LoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2
      variant="tertiary"
      size="medium"
      onClick={open}
      className="text-sub border border-default"
    >
      <Typo.ButtonText size="medium">로그인/가입</Typo.ButtonText>
    </ButtonV2>
  );
}

function HeaderLoginDrawer() {
  return (
    <LoginDrawer>
      <LoginDrawerTrigger />
    </LoginDrawer>
  );
}

const HIDDEN_HEADER_PATHS = ["/editor"];

export function Header() {
  const pathname = usePathname();

  if (HIDDEN_HEADER_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }

  return <ProfileHeader fallbackRight={<HeaderLoginDrawer />} />;
}

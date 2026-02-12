"use client";

import { ProfileHeader } from "@/components/common/ProfileHeader";
import { ButtonV2, Typo, useDrawer } from "@repo/ui/components";
import { LoginDrawer } from "./LoginDrawer";

function LoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2 variant="tertiary" size="medium" onClick={open} className="text-sub">
      <Typo.Body size="medium">로그인/가입</Typo.Body>
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

export function Header() {
  return <ProfileHeader fallbackRight={<HeaderLoginDrawer />} />;
}

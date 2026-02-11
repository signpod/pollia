"use client";

import { ProfileHeader } from "@/components/common/ProfileHeader";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import {
  ButtonV2,
  DrawerContent,
  DrawerProvider,
  IconButton,
  KakaoLoginButton,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { X } from "lucide-react";

function LoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2 variant="secondary" size="medium" onClick={open} className="text-sub">
      <Typo.Body size="medium">로그인/가입</Typo.Body>
    </ButtonV2>
  );
}

function LoginDrawerContent() {
  const { close } = useDrawer();
  const { handleKakaoLogin } = useKakaoLogin();

  return (
    <DrawerContent className="max-w-[600px]">
      <div className="relative px-5 pb-5 pt-5">
        <IconButton icon={X} onClick={close} aria-label="닫기" className="absolute right-5 top-5" />
        <div className="flex flex-col items-center gap-6 pt-4 pb-2">
          <Typo.MainTitle size="small" className="whitespace-pre-line text-center">
            {"카카오 계정으로 로그인 후\n이용할 수 있어요"}
          </Typo.MainTitle>
          <KakaoLoginButton
            inlineIcon
            onClick={handleKakaoLogin}
            className="w-full bg-[#FEE500] text-default hover:bg-[#FEE500]/90"
          />
        </div>
      </div>
    </DrawerContent>
  );
}

function LoginDrawer() {
  return (
    <DrawerProvider>
      <LoginDrawerTrigger />
      <LoginDrawerContent />
    </DrawerProvider>
  );
}

export function Header() {
  return <ProfileHeader fallbackRight={<LoginDrawer />} />;
}

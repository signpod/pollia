"use client";

import { ROUTES } from "@/constants/routes";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useCurrentUser } from "@/hooks/user";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import {
  DrawerContent,
  DrawerProvider,
  IconButton,
  KakaoLoginButton,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { X } from "lucide-react";
import Link from "next/link";

function LoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <button type="button" onClick={open} className="text-sub">
      <Typo.Body size="medium">로그인/가입</Typo.Body>
    </button>
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

export function Header() {
  const { data: currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser;

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-5">
      <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] py-3">
        <PolliaIcon className="size-[11px] text-primary" />
        <PolliaWordmark className="h-[22px] text-black" />
      </Link>
      {!isLoggedIn && (
        <DrawerProvider>
          <LoginDrawerTrigger />
          <LoginDrawerContent />
        </DrawerProvider>
      )}
    </header>
  );
}

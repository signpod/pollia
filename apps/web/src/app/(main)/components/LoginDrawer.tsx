"use client";

import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import {
  DrawerContent,
  DrawerProvider,
  IconButton,
  KakaoLoginButton,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { X } from "lucide-react";
import type { ReactNode } from "react";

function LoginDrawerContent() {
  const { close } = useDrawer();
  const { handleKakaoLogin } = useKakaoLogin();

  return (
    <DrawerContent containerClassName="mx-auto max-w-[600px]">
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

export function LoginDrawer({ children }: { children: ReactNode }) {
  return (
    <DrawerProvider>
      {children}
      <LoginDrawerContent />
    </DrawerProvider>
  );
}

export { useDrawer as useLoginDrawer };

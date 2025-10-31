"use client";

import { setCurrentUrlAsRedirect } from "@/lib/cookie";
import CustomMusic from "@public/svgs//custom-music.svg";
import PollPollECat from "@public/svgs//poll-poll-e-cat.svg";
import { Button, Dialog, DialogOverlay, DialogPortal, Typo } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";

interface LoginModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | null>(null);

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return context;
}

interface LoginModalProviderProps {
  children: React.ReactNode;
}

export function LoginModalProvider({ children }: LoginModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogin = useCallback(() => {
    close();
    setCurrentUrlAsRedirect();
    router.push("/login");
  }, [close, router]);

  return (
    <LoginModalContext.Provider value={{ isOpen, open, close }}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed top-[50%] left-[50%] z-50 w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg">
            <div className="flex flex-col items-center gap-6 p-6">
              <div className="text-primary relative">
                <PollPollECat width={120} height={120} />
                <CustomMusic width={24} height={24} className="absolute top-0 -right-4" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Typo.MainTitle size={"small"}>로그인하고 함께 시작해볼까요?</Typo.MainTitle>
                <Typo.Body size="medium">더 재미있는 기능이 기다리고 있어요!</Typo.Body>
              </div>

              <div className="flex w-full gap-3">
                <Button variant="secondary" fullWidth onClick={close} className="flex-1">
                  취소
                </Button>
                <Button variant="primary" fullWidth onClick={handleLogin} className="flex-1">
                  로그인 하기
                </Button>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </LoginModalContext.Provider>
  );
}

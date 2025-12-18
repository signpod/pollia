"use client";

import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";

import { LoginModalProvider } from "@/components/providers/LoginModalProvider";
import { AuthError } from "@/hooks/login/useKakaoLogin";
import { MissionIntro } from "./MissionIntro";

interface MissionClientWrapperProps {
  initialError: AuthError | null;
}

export function MissionClientWrapper({ initialError }: MissionClientWrapperProps) {
  return (
    <LoginModalProvider>
      <FixedBottomLayout className="bg-zinc-700 min-h-screen" hasGradientBlur>
        <FixedTopLayout>
          <MissionIntro initialError={initialError} />
        </FixedTopLayout>
      </FixedBottomLayout>
    </LoginModalProvider>
  );
}

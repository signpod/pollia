"use client";

import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import type { ReactNode } from "react";
import { MissionIntro } from "./MissionIntro";

interface MissionClientWrapperProps {
  initialError: AuthError | null;
  children: ReactNode;
}

export function MissionClientWrapper({ initialError, children }: MissionClientWrapperProps) {
  return (
    <FixedBottomLayout className="min-h-screen" hasGradientBlur>
      <FixedTopLayout>
        <MissionIntro initialError={initialError}>{children}</MissionIntro>
      </FixedTopLayout>
    </FixedBottomLayout>
  );
}

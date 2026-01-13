"use client";

import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";

import type { ReactNode } from "react";
import { MissionIntro } from "./MissionIntro";

interface MissionClientWrapperProps {
  children: ReactNode;
}

export function MissionClientWrapper({ children }: MissionClientWrapperProps) {
  return (
    <FixedBottomLayout className="min-h-screen" hasGradientBlur>
      <FixedTopLayout>
        <MissionIntro>{children}</MissionIntro>
      </FixedTopLayout>
    </FixedBottomLayout>
  );
}

"use client";

import { FixedBottomLayout } from "@repo/ui/components";

import type { ReactNode } from "react";
import { MissionIntro } from "./MissionIntro";

interface MissionClientWrapperProps {
  children: ReactNode;
}

export function MissionClientWrapper({ children }: MissionClientWrapperProps) {
  return (
    <FixedBottomLayout hasGradientBlur>
      <MissionIntro>{children}</MissionIntro>
    </FixedBottomLayout>
  );
}

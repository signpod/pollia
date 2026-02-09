"use client";

import { FixedBottomLayout } from "@repo/ui/components";

import type { ReactNode } from "react";

interface MissionClientWrapperProps {
  children: ReactNode;
}

export function MissionClientWrapper({ children }: MissionClientWrapperProps) {
  return <FixedBottomLayout>{children}</FixedBottomLayout>;
}

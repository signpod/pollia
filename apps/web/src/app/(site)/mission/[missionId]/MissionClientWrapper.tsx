"use client";

import { FixedBottomLayout } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";

import type { ReactNode } from "react";

interface MissionClientWrapperProps {
  children: ReactNode;
  dehydratedState: DehydratedState;
}

export function MissionClientWrapper({ children, dehydratedState }: MissionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <FixedBottomLayout>{children}</FixedBottomLayout>
    </HydrationBoundary>
  );
}

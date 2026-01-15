"use client";

import {} from "@repo/ui/components";

import type { ReactNode } from "react";
import { MissionIntro } from "./MissionIntro";

interface MissionClientWrapperProps {
  children: ReactNode;
}

export function MissionClientWrapper({ children }: MissionClientWrapperProps) {
  return <MissionIntro>{children}</MissionIntro>;
}

"use client";

import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import type { ReactNode } from "react";
import { ProfileHeader } from "./ProfileHeader";

interface NavigableProfileHeaderProps {
  fallbackRight?: ReactNode;
}

export function NavigableProfileHeader({ fallbackRight }: NavigableProfileHeaderProps) {
  const canGoBack = useCanGoBack();

  return <ProfileHeader showBack={canGoBack} fallbackRight={fallbackRight} />;
}

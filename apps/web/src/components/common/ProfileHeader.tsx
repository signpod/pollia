"use client";

import { ROUTES } from "@/constants/routes";
import { useGoBack } from "@/hooks/common/useGoBack";
import { useCurrentUser } from "@/hooks/user";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ProfileHeaderView } from "./ProfileHeaderView";

interface ProfileHeaderProps {
  showBack?: boolean;
  fallbackRight?: ReactNode;
}

export function ProfileHeader({ showBack, fallbackRight }: ProfileHeaderProps) {
  const router = useRouter();
  const goBack = useGoBack();
  const { data: currentUser } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();

  return (
    <ProfileHeaderView
      showBack={showBack}
      fallbackRight={fallbackRight}
      user={currentUser}
      profileImageUrl={profileImageUrl}
      onBack={goBack}
      onSearchClick={() => router.push(ROUTES.SEARCH)}
      onProfileClick={() => router.push(ROUTES.ME)}
    />
  );
}

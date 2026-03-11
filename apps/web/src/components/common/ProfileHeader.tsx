"use client";

import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/user";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ProfileHeaderView } from "./ProfileHeaderView";

interface ProfileHeaderProps {
  showBack?: boolean;
  showHomeIcon?: boolean;
  fallbackRight?: ReactNode;
  rightExtra?: ReactNode;
}

export function ProfileHeader({
  showBack = false,
  showHomeIcon = false,
  fallbackRight,
  rightExtra,
}: ProfileHeaderProps) {
  const router = useRouter();
  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();

  const showSkeleton = isLoading && !isError;

  return (
    <ProfileHeaderView
      showBack={showBack}
      showHomeIcon={showHomeIcon}
      rightExtra={rightExtra}
      fallbackRight={
        showSkeleton ? (
          <div className="size-9 animate-pulse rounded-full bg-zinc-200" />
        ) : (
          fallbackRight
        )
      }
      user={currentUser}
      profileImageUrl={profileImageUrl}
      onBack={() => router.back()}
      onSearchClick={() => router.push(ROUTES.SEARCH)}
      onProfileClick={() => router.push(ROUTES.ME)}
    />
  );
}

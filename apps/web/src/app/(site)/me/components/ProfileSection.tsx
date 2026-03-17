"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { Typo } from "@repo/ui/components";

export function ProfileSection() {
  const { data: user } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();

  const currentName = user?.name ?? "";
  const currentEmail = user?.email ?? "";

  return (
    <section className="flex items-center gap-4 px-5">
      <UserAvatar
        size="large"
        imageUrl={profileImageUrl}
        className="!size-[72px] border-[0.75px] border-zinc-200"
      />
      <div className="flex flex-col">
        <Typo.MainTitle size="medium">{currentName}</Typo.MainTitle>
        <Typo.Body size="medium" className="text-sub">
          {currentEmail}
        </Typo.Body>
      </div>
    </section>
  );
}

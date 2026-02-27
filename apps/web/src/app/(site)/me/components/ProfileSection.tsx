"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { Typo } from "@repo/ui/components";
import Link from "next/link";

export function ProfileSection() {
  const { data: user } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();

  const currentName = user?.name ?? "";
  const currentEmail = user?.email ?? "";

  return (
    <section className="flex flex-col items-center gap-3 px-5 pt-2">
      <UserAvatar size="large" imageUrl={profileImageUrl} />
      <div className="flex flex-col items-center gap-1">
        <Typo.MainTitle size="small">{currentName}</Typo.MainTitle>
        <Typo.Body size="small" className="text-sub">
          {currentEmail}
        </Typo.Body>
      </div>
      <Link href={ROUTES.ME_ACCOUNT} className="rounded-full border border-zinc-200 px-4 py-1.5">
        <Typo.Body size="small" className="font-semibold text-zinc-600">
          계정 관리
        </Typo.Body>
      </Link>
    </section>
  );
}

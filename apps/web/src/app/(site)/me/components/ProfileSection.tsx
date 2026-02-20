"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import { ButtonV2, Typo } from "@repo/ui/components";
import { useRouter } from "next/navigation";

interface ProfileSectionProps {
  name: string;
  email: string;
}

export function ProfileSection({ name, email }: ProfileSectionProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center gap-4 px-5">
      <UserAvatar size="large" />
      <div className="flex flex-col items-center gap-1">
        <Typo.MainTitle size="medium">{name}</Typo.MainTitle>
        <Typo.Body size="medium" className="text-info">
          {email}
        </Typo.Body>
      </div>
      <ButtonV2 variant="secondary" size="medium" onClick={() => router.push(ROUTES.ME_ACCOUNT)}>
        <div className="flex items-center justify-center">
          <Typo.ButtonText size="medium">계정 관리</Typo.ButtonText>
        </div>
      </ButtonV2>
    </section>
  );
}

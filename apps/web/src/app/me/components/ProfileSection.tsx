"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { useEffect, useState } from "react";

interface ProfileSectionProps {
  name: string;
  email: string;
}

export function ProfileSection({ name, email }: ProfileSectionProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  return (
    <section className="flex flex-col items-center gap-4 px-5">
      <UserAvatar size="large" />
      <div className="flex flex-col items-center gap-1">
        <Typo.MainTitle size="medium">{name}</Typo.MainTitle>
        <Typo.Body size="medium" className="text-info">
          {email}
        </Typo.Body>
      </div>
      <ButtonV2
        variant="secondary"
        size="medium"
        data-tooltip-id="account-manage"
        onClick={() => setShowTooltip(prev => !prev)}
      >
        <div className="flex items-center justify-center">
          <Typo.ButtonText size="medium">계정 관리</Typo.ButtonText>
        </div>
      </ButtonV2>
      {showTooltip && (
        <Tooltip id="account-manage" placement="bottom">
          <Typo.Body size="small" className="whitespace-nowrap text-zinc-600">
            곧 만나볼 수 있어요! 조금만 기다려주세요
          </Typo.Body>
        </Tooltip>
      )}
    </section>
  );
}

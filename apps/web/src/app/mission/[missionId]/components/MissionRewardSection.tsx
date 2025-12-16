"use client";

import { Typo } from "@repo/ui/components";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";

interface MissionRewardSectionProps {
  rewardImageUrl?: string;
  rewardName?: string;
  brandLogoUrl?: string;
}

export function MissionRewardSection({
  rewardImageUrl,
  rewardName,
  brandLogoUrl,
}: MissionRewardSectionProps) {
  return (
    <div className="flex flex-col gap-8 bg-zinc-50 px-5 py-8">
      <SectionHeader
        badgeText="참여 혜택"
        title={
          <>
            참여해주신 모든 분께
            <br />
            감사의 선물을 드려요!
          </>
        }
      />

      <div className="w-full rounded-md overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {rewardImageUrl && (
          <Image
            src={rewardImageUrl}
            alt="reward"
            width={400}
            height={400}
            className="w-full h-auto object-contain"
          />
        )}
        <div className="w-full flex flex-col p-4 gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="bg-violet-50 rounded-sm px-3 py-2">
              <Typo.Body size="medium" className="text-primary">
                전원 증정
              </Typo.Body>
            </div>
            {brandLogoUrl && (
              <Image
                src={brandLogoUrl}
                alt="reward"
                width={40}
                height={40}
                className="object-contain"
              />
            )}
          </div>
          {rewardName && <Typo.MainTitle size="small">{rewardName}</Typo.MainTitle>}
        </div>
      </div>
    </div>
  );
}

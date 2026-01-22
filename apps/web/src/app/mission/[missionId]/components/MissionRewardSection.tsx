"use client";
import { Typo } from "@repo/ui/components";
import { formatDate } from "date-fns";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";

const REWARD_SECTION_BADGE_TEXT = "참여 혜택";
const REWARD_SECTION_TITLE = (
  <Typo.MainTitle size="small" className="text-center">
    참여해주신 분들께
    <br />
    감사의 선물을 드려요!
  </Typo.MainTitle>
);

interface MissionRewardSectionProps {
  rewardImageUrl?: string;
  rewardName?: string;
  rewardScheduledDate?: Date;
}

export function MissionRewardSection({
  rewardImageUrl,
  rewardName,
  rewardScheduledDate,
}: MissionRewardSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader badgeText={REWARD_SECTION_BADGE_TEXT} title={REWARD_SECTION_TITLE} />

      <div className="w-auto rounded-md overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 flex flex-col gap-4">
        <div className="aspect-square relative w-full flex items-center justify-center overflow-hidden rounded-sm">
          {rewardImageUrl && (
            <Image
              src={rewardImageUrl}
              alt="reward"
              width={300}
              height={300}
              className="w-full h-auto object-contain rounded-sm"
            />
          )}
        </div>

        <div className="w-full flex flex-col gap-3 items-center">
          {rewardName && (
            <Typo.SubTitle size="large" className="break-keep pl-1">
              {rewardName}
            </Typo.SubTitle>
          )}
          {rewardScheduledDate && (
            <div className="ring-1 ring-default rounded-3xl px-3 py-1">
              <Typo.Body size="medium" className="text-default">
                {`${formatDate(rewardScheduledDate, "yy.MM.dd")} 순차지급`}
              </Typo.Body>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

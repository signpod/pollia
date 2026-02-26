"use client";
import { AdaptiveImage } from "@/components/common/AdaptiveImage";
import { Typo } from "@repo/ui/components";
import { formatDate } from "date-fns";
import { useEffect, useState } from "react";
import { SectionHeader } from "./SectionHeader";

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
  const [formattedScheduledDate, setFormattedScheduledDate] = useState<string | null>(null);

  useEffect(() => {
    if (rewardScheduledDate) {
      setFormattedScheduledDate(formatDate(rewardScheduledDate, "yy.MM.dd"));
    }
  }, [rewardScheduledDate]);

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
      <SectionHeader title="참여 리워드" subtitle="참여해주신 분들께 감사의 선물을 드려요!" />

      <div className="flex flex-col gap-3">
        {rewardImageUrl && (
          <div className="rounded-lg overflow-hidden">
            <AdaptiveImage src={rewardImageUrl} alt="reward" />
          </div>
        )}
        <div className="flex flex-col">
          {rewardName && <Typo.SubTitle size="large">{rewardName}</Typo.SubTitle>}
          {formattedScheduledDate && (
            <Typo.Body size="medium" className="text-zinc-400">
              {`${formattedScheduledDate} 순차 지급`}
            </Typo.Body>
          )}
        </div>
      </div>
    </div>
  );
}

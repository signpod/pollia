"use client";
import { AdaptiveImage } from "@/components/common/AdaptiveImage";
import { Typo } from "@repo/ui/components";
import { formatDate } from "date-fns";
import { useEffect, useState } from "react";

interface MissionRewardSectionProps {
  rewardImageUrl?: string;
  rewardName?: string;
  rewardDescription?: string;
  rewardScheduledDate?: Date;
}

export function MissionRewardSection({
  rewardImageUrl,
  rewardName,
  rewardDescription,
  rewardScheduledDate,
}: MissionRewardSectionProps) {
  const [formattedScheduledDate, setFormattedScheduledDate] = useState<string | null>(null);

  useEffect(() => {
    if (rewardScheduledDate) {
      setFormattedScheduledDate(formatDate(rewardScheduledDate, "yy.MM.dd"));
    }
  }, [rewardScheduledDate]);

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-2 py-3 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      <div className="flex flex-1 flex-col items-center gap-2">
        {rewardImageUrl && (
          <div className="size-[120px] overflow-hidden rounded-xl bg-zinc-50 p-2">
            <AdaptiveImage src={rewardImageUrl} alt="reward" className="size-full rounded-xl" />
          </div>
        )}
        <div className="flex flex-col items-center">
          {rewardName && (
            <Typo.SubTitle size="large" className="text-center">
              {rewardName}
            </Typo.SubTitle>
          )}
          {rewardDescription && (
            <Typo.Body size="medium" className="text-center text-zinc-400">
              {rewardDescription}
            </Typo.Body>
          )}
          {formattedScheduledDate && (
            <Typo.Body size="medium" className="text-center text-zinc-400 pt-4">
              {`${formattedScheduledDate} 순차 지급`}
            </Typo.Body>
          )}
        </div>
      </div>
    </div>
  );
}

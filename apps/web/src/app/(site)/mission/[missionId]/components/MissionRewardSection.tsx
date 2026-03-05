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
    <div className="flex flex-col gap-5">
      <div>
        {rewardName && <Typo.Body size="large">{rewardName}</Typo.Body>}
        {rewardDescription && (
          <Typo.Body size="medium" className="text-zinc-500">
            {rewardDescription}
          </Typo.Body>
        )}
        {formattedScheduledDate && (
          <Typo.Body size="large" className="font-bold">
            {`${formattedScheduledDate} 순차 지급`}
          </Typo.Body>
        )}
      </div>
      {rewardImageUrl && (
        <div className="overflow-hidden rounded-lg [&_img]:h-auto [&_img]:w-full">
          <AdaptiveImage src={rewardImageUrl} alt="reward" />
        </div>
      )}
    </div>
  );
}

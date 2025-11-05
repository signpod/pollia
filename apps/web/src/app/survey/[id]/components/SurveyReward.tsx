import { Typo } from "@repo/ui/components";
import Image from "next/image";

interface SurveyRewardProps {
  rewardName: string;
  rewardImage?: string;
  rewardDescription?: string;
}

export function SurveyReward({ rewardName, rewardImage, rewardDescription }: SurveyRewardProps) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-sm bg-white p-3 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      <Typo.Body size="medium" className="text-info">
        설문 리워드
      </Typo.Body>
      <div className="flex w-full items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-light">
          {rewardImage && (
            <Image
              src={rewardImage}
              alt={rewardName}
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typo.Body size="medium">{rewardName}</Typo.Body>
          {rewardDescription && (
            <Typo.Body size="small" className="text-sub">
              * {rewardDescription}
            </Typo.Body>
          )}
        </div>
      </div>
    </div>
  );
}

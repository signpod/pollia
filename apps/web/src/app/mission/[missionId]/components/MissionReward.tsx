"use client";

import GiftIcon from "@public/svgs/gift-color-icon.svg";
import { Typo } from "@repo/ui/components";
import Image from "next/image";

export interface MissionRewardProps {
  rewardImage: string;
  rewardName: string;
}

export function MissionReward({ rewardImage, rewardName }: MissionRewardProps) {
  return (
    <div className="flex gap-4 w-full rounded-sm justify-between items-center bg-black/50 p-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <GiftIcon className="size-5" />
          <Typo.Body size="medium" className="text-zinc-300">
            해당 미션 완주 시
          </Typo.Body>
        </div>
        <Typo.SubTitle size="large" className="break-keep text-white">
          {rewardName}
        </Typo.SubTitle>
      </div>

      <div className="relative size-12 rounded-sm overflow-hidden">
        <Image
          src={rewardImage}
          alt={rewardName}
          width={48}
          height={48}
          className="object-contain"
        />
      </div>
    </div>
  );
}

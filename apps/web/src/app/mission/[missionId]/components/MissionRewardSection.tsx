"use client";

import { PaymentType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";

const REWARD_SECTION_BADGE_TEXT = "참여 혜택";
const REWARD_SECTION_TITLE = (
  <>
    참여해주신 모든 분께
    <br />
    감사의 선물을 드려요!
  </>
);

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.IMMEDIATE]: "완료 후 즉시 지급",
  [PaymentType.SCHEDULED]: "완료 후 예약 지급",
} as const;

interface MissionRewardSectionProps {
  rewardImageUrl?: string;
  rewardName?: string;
  rewardPaymentType?: PaymentType;
  brandLogoUrl?: string;
}

export function MissionRewardSection({
  rewardImageUrl,
  rewardName,
  rewardPaymentType,
  brandLogoUrl,
}: MissionRewardSectionProps) {
  return (
    <div className="flex flex-col gap-8 bg-zinc-50 px-5 py-8">
      <SectionHeader badgeText={REWARD_SECTION_BADGE_TEXT} title={REWARD_SECTION_TITLE} />

      <div className="w-full rounded-md overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {rewardImageUrl && (
          <Image
            src={rewardImageUrl}
            alt="reward"
            width={400}
            height={400}
            className="w-full h-auto aspect-square object-cover"
          />
        )}
        <div className="w-full flex flex-col p-4 gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="bg-violet-50 rounded-sm px-3 py-2">
              <Typo.Body size="medium" className="text-primary">
                {rewardPaymentType ? PAYMENT_TYPE_LABELS[rewardPaymentType] : ""}
              </Typo.Body>
            </div>
            {brandLogoUrl && (
              <Image
                src={brandLogoUrl}
                alt="Brand Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            )}
          </div>
          {rewardName && (
            <Typo.MainTitle size="small" className="break-keep">
              {rewardName}
            </Typo.MainTitle>
          )}
        </div>
      </div>
    </div>
  );
}

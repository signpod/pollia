"use client";

import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import { useState } from "react";

interface RewardCardProps {
  reward: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    paymentType: string;
    scheduledDate: Date | null;
    paidAt: Date | null;
    missions: { id: string }[];
  };
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function RewardCard({ reward }: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !reward.imageUrl;
  const isPaid = reward.paidAt !== null;

  const statusDate = isPaid ? reward.paidAt : reward.scheduledDate;
  const statusLabel = isPaid ? "지급 완료" : "지급 예정";
  const badgeText = statusDate ? `${formatDate(statusDate)} ${statusLabel}` : statusLabel;

  const missionId = reward.missions[0]?.id;
  const href = missionId ? `/mission/${missionId}` : undefined;

  const content = (
    <div className="flex items-start gap-3">
      <div className="relative size-[118px] shrink-0 overflow-hidden rounded-2xl border border-zinc-200">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-10 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={reward.imageUrl ?? ""}
            alt={reward.name}
            fill
            sizes="118px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span
          className={`w-fit rounded-[6px] px-2 py-1 ${isPaid ? "bg-zinc-100" : "bg-orange-50"}`}
        >
          <Typo.Body size="small" className={isPaid ? "text-zinc-500" : "text-orange-600"}>
            {badgeText}
          </Typo.Body>
        </span>
        <Typo.SubTitle size="large" className="truncate">
          {reward.name}
        </Typo.SubTitle>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

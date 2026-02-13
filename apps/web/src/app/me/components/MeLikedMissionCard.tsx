"use client";

import { MissionLikeButton } from "@/app/(main)/components/MissionLikeButton";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { Mission } from "@prisma/client";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import Image from "next/image";
import { useState } from "react";

interface MeLikedMissionCardProps {
  mission: Mission;
}

export function MeLikedMissionCard({ mission }: MeLikedMissionCardProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[mission.category] ?? mission.category;

  return (
    <a
      href={`/mission/${mission.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-100">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-16 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={mission.imageUrl!}
            alt={mission.title}
            fill
            sizes="(max-width: 600px) 50vw, 300px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <MissionLikeButton missionId={mission.id} className="absolute bottom-3 right-3" />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-xs font-bold text-info">{categoryLabel}</span>
        <p className="line-clamp-2 text-sm font-bold leading-tight text-default">{mission.title}</p>
      </div>
    </a>
  );
}

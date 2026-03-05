"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { MissionCategory } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MissionLikeButton } from "./MissionLikeButton";

export interface SurveyCardData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  daysLeft: number;
  reward: string | null;
  currentParticipants: number;
  maxParticipants: number;
  category: MissionCategory;
  createdAt: string;
  isActive: boolean;
  deadline: string | null;
  startDate: string | null;
  likesCount: number;
  // TODO: 백엔드에 조회수(viewCount) 필드 구현 시 실제 데이터로 교체
  viewCount: number;
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

interface SurveyCardProps {
  survey: SurveyCardData;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !survey.imageUrl;

  const categoryLabel = MISSION_CATEGORY_LABELS[survey.category] ?? survey.category;

  return (
    <Link href={`/mission/${survey.id}`} className="group flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-default">
        <Image
          src={showFallback ? thumbnailFallback : survey.imageUrl}
          alt={survey.title}
          fill
          sizes="(max-width: 600px) 50vw, 300px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
        <MissionLikeButton missionId={survey.id} className="absolute bottom-3 right-3" />
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <span className="text-xs font-bold text-info">{categoryLabel}</span>
        <div className="flex flex-col gap-0.5">
          <p className="line-clamp-2 text-sm font-semibold leading-normal text-default">
            {survey.title}
          </p>
          <p className="text-[11px] font-bold text-zinc-400">
            조회 {formatCompactNumber(survey.viewCount)} · 찜{" "}
            {formatCompactNumber(survey.likesCount)}
          </p>
        </div>
      </div>
    </Link>
  );
}

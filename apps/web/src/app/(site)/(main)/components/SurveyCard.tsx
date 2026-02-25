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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-default">
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

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-info">{categoryLabel}</span>
          <p className="line-clamp-2 text-base font-bold leading-normal text-default">
            {survey.title}
          </p>
        </div>

        {/* TODO: 상태 뱃지 (진행 상태, 반응 상태, 남은 기한) 데이터 연동 후 추가 */}
      </div>
    </Link>
  );
}

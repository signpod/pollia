"use client";

import type { MissionCategory } from "@prisma/client";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LABELS } from "./CategoryBadge";

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

  const categoryLabel = CATEGORY_LABELS[survey.category] ?? survey.category;

  return (
    <Link
      href={`/mission/${survey.id}`}
      className="group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-default">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PolliaIcon className="size-16 text-violet-200" />
          </div>
        ) : (
          <Image
            src={survey.imageUrl}
            alt={survey.title}
            fill
            sizes="(max-width: 600px) 50vw, 300px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <button
          type="button"
          className="absolute bottom-3 right-3 text-zinc-400"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart className="size-6 fill-white/40 text-zinc-200" />
        </button>
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

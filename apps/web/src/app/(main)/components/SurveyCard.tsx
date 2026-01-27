"use client";

import { stripHtmlTags } from "@/app/admin/lib/utils";
import type { MissionCategory } from "@prisma/client";
import GiftIcon from "@public/svgs/gift-color-icon.svg";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { ProgressBar, Typo } from "@repo/ui/components";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CategoryBadge } from "./CategoryBadge";

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
}

interface SurveyCardProps {
  survey: SurveyCardData;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const [imageError, setImageError] = useState(false);
  const progressPercent = (survey.currentParticipants / survey.maxParticipants) * 100;
  const showFallback = imageError || !survey.imageUrl;

  return (
    <Link
      href={`/mission/${survey.id}`}
      className=" shadow-[0_4px_20px_rgba(0,0,0,0.08)] group flex h-full flex-col overflow-hidden rounded-xl bg-default transition-all hover:-translate-y-1 hover:shadow-effect-default"
    >
      <div className="relative h-36 shrink-0 overflow-hidden">
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center bg-zinc-50">
            <PolliaIcon className="size-16 text-violet-200" />
          </div>
        ) : (
          <Image
            src={survey.imageUrl}
            alt={survey.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}
        <span className="absolute left-3 top-3">
          <CategoryBadge category={survey.category} />
        </span>
        {survey.reward && (
          <span className="absolute right-3 top-3 rounded bg-zinc-900/70 px-2.5 py-1 text-xs font-semibold text-yellow-400">
            <GiftIcon className="size-3.5" aria-hidden="true" />
            {survey.reward}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-3 text-xs text-info">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {survey.duration}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            D-{survey.daysLeft}
          </span>
        </div>
        <div className="flex-1">
          <Typo.SubTitle className="mb-1.5 line-clamp-2 text-sm">{survey.title}</Typo.SubTitle>
          <Typo.Body size="small" className="line-clamp-2 text-sub">
            {stripHtmlTags(survey.description)}
          </Typo.Body>
        </div>

        <div className="mt-auto pt-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-info">참여 현황</span>
            <span className="font-semibold text-violet-500">
              {survey.currentParticipants.toLocaleString()} /{" "}
              {survey.maxParticipants.toLocaleString()}명
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            containerClassName="h-1 rounded-full"
            indicatorClassName="bg-violet-500 rounded-full"
          />
        </div>
      </div>
    </Link>
  );
}

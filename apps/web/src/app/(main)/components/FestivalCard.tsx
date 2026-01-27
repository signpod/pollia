"use client";

import type { FestivalData } from "@/types/dto/festival";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { Typo } from "@repo/ui/components";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CategoryBadge } from "./CategoryBadge";

interface FestivalCardProps {
  festival: FestivalData;
}

export function FestivalCard({ festival }: FestivalCardProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !festival.imageUrl;

  return (
    <Link
      href={`/festivals/${festival.id}`}
      className="group block overflow-hidden rounded-xl bg-default transition-all hover:-translate-y-1 hover:shadow-effect-default shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-36 overflow-hidden">
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center bg-zinc-50">
            <PolliaIcon className="size-16 text-violet-200" />
          </div>
        ) : (
          <Image
            src={festival.imageUrl}
            alt={festival.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized={festival.imageUrl.includes("visitkorea")}
            onError={() => setImageError(true)}
          />
        )}
        <span className="absolute left-3 top-3">
          <CategoryBadge category="EVENT" />
        </span>
      </div>
      <div className="p-4">
        <Typo.SubTitle className="mb-1.5 line-clamp-2 text-sm">{festival.title}</Typo.SubTitle>
        <Typo.Body size="small" className="mb-3 line-clamp-2 text-sub">
          {festival.description}
        </Typo.Body>
        <div className="flex flex-col gap-1.5 text-xs text-info">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {festival.month} {festival.dateRange}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {festival.location}
          </span>
        </div>
      </div>
    </Link>
  );
}

export type { FestivalData };

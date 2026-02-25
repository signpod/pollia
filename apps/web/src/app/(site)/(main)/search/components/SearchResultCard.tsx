"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { MissionSearchRecord } from "@/server/search";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MissionLikeButton } from "../../components/MissionLikeButton";

interface SearchResultCardProps {
  record: MissionSearchRecord;
}

export function SearchResultCard({ record }: SearchResultCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = record.imageUrl ?? "";
  const showFallback = imageError || !imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[record.category] ?? record.category;

  return (
    <Link href={`/mission/${record.objectID}`} className="group flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-default">
        <Image
          src={showFallback ? thumbnailFallback : imageUrl}
          alt={record.title}
          fill
          sizes="(max-width: 600px) 50vw, 300px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
        <MissionLikeButton missionId={record.objectID} className="absolute bottom-3 right-3" />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-xs font-bold text-info">{categoryLabel}</span>
        <p className="line-clamp-2 text-base font-bold leading-normal text-default">
          {record.title}
        </p>
      </div>
    </Link>
  );
}

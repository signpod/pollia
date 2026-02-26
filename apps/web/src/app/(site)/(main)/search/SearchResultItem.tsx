"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { MissionCategory } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MissionLikeButton } from "../components/MissionLikeButton";

export interface SearchResultItemData {
  id: string;
  title: string;
  imageUrl: string;
  category: MissionCategory;
}

interface SearchResultItemProps {
  item: SearchResultItemData;
}

export function SearchResultItem({ item }: SearchResultItemProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !item.imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[item.category] ?? item.category;

  return (
    <Link href={`/mission/${item.id}`} className="flex items-center gap-4 bg-white px-5 py-3">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={showFallback ? thumbnailFallback : item.imageUrl}
          alt={item.title}
          fill
          sizes="80px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typo.Body size="small" className="text-info">
          {categoryLabel}
        </Typo.Body>
        <Typo.Body size="medium" className="line-clamp-2">
          {item.title}
        </Typo.Body>
      </div>

      <MissionLikeButton missionId={item.id} className="shrink-0" />
    </Link>
  );
}

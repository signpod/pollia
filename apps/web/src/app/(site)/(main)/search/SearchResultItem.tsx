"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { MissionCategory } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

export interface SearchResultItemData {
  id: string;
  title: string;
  imageUrl: string;
  category: MissionCategory;
  likesCount: number;
  // TODO: 백엔드에 조회수(viewCount) 필드 구현 시 실제 데이터로 교체
  viewCount: number;
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

interface SearchResultItemProps {
  item: SearchResultItemData;
  query?: string;
}

export function SearchResultItem({ item, query = "" }: SearchResultItemProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !item.imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[item.category] ?? item.category;

  return (
    <Link href={`/mission/${item.id}`} className="flex items-start gap-2">
      <div className="relative size-[72px] shrink-0 overflow-hidden rounded-md border border-default">
        <Image
          src={showFallback ? thumbnailFallback : item.imageUrl}
          alt={item.title}
          fill
          sizes="72px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typo.Body size="small" className="text-info">
          {categoryLabel}
        </Typo.Body>
        <Typo.Body size="medium" className="line-clamp-2">
          {highlightMatch(item.title, query)}
        </Typo.Body>
        <p className="text-[11px] font-bold text-zinc-400">
          조회 {formatCompactNumber(item.viewCount)} · 찜 {formatCompactNumber(item.likesCount)}
        </p>
      </div>
    </Link>
  );
}

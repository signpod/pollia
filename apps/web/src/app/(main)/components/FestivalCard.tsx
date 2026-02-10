"use client";

import type { FestivalData } from "@/types/dto/festival";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface FestivalCardProps {
  festival: FestivalData;
}

export function FestivalCard({ festival }: FestivalCardProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !festival.imageUrl;

  return (
    <Link
      href={`/festivals/${festival.id}`}
      className="group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-default">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PolliaIcon className="size-16 text-violet-200" />
          </div>
        ) : (
          <Image
            src={festival.imageUrl}
            alt={festival.title}
            fill
            sizes="(max-width: 600px) 50vw, 300px"
            className="object-cover"
            unoptimized={festival.imageUrl.includes("visitkorea")}
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
          <span className="text-xs font-bold text-info">이벤트</span>
          <p className="line-clamp-2 text-base font-bold leading-normal text-default">
            {festival.title}
          </p>
        </div>

        {/* TODO: 상태 뱃지 데이터 연동 후 추가 */}
      </div>
    </Link>
  );
}

export type { FestivalData };

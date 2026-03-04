"use client";

import { MissionImage } from "@/app/(site)/mission/[missionId]/components/MissionImage";
import { formatCompactNumber } from "@/lib/format";
import Lock from "@public/svgs/lock.svg";
import { Typo } from "@repo/ui/components";
import type { ReactNode, RefObject } from "react";

export interface MissionIntroTemplateProps {
  header?: ReactNode;
  imageUrl?: string | null;
  missionId?: string;
  title?: string | null;
  subtitle?: string | null;
  authorName?: string | null;
  authorImageUrl?: string | null;
  isRequirePassword?: boolean;
  viewCount?: number;
  likesCount?: number;
  titleRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
}

export function MissionIntroTemplate({
  header,
  imageUrl,
  title,
  subtitle,
  authorName,
  authorImageUrl,
  isRequirePassword,
  viewCount = 0,
  likesCount = 0,
  titleRef,
  children,
}: MissionIntroTemplateProps) {
  const effectiveImageUrl = imageUrl || "/images/intro-fallback.png";

  return (
    <>
      {header}
      <div ref={titleRef} className="flex flex-col gap-1.5 bg-white px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          {subtitle && (
            <Typo.Body size="small" className="text-zinc-500">
              {subtitle}
            </Typo.Body>
          )}
          <Typo.Body size="small" className="text-zinc-400">
            조회 {formatCompactNumber(viewCount)} · 찜 {formatCompactNumber(likesCount)}
          </Typo.Body>
        </div>
        <div className="break-keep">
          <Typo.MainTitle size="large" className="inline text-zinc-900">
            {title}
          </Typo.MainTitle>
          {isRequirePassword && (
            <Lock className="ml-1 inline-block size-5 align-[0.1em] text-zinc-400" />
          )}
        </div>
        {authorName && (
          <div className="flex items-center gap-1.5">
            {authorImageUrl && (
              <img src={authorImageUrl} alt="" className="size-5 rounded-full object-cover" />
            )}
            <Typo.Body size="medium" className="text-zinc-600">
              {authorName}
            </Typo.Body>
          </div>
        )}
      </div>

      <div className="relative w-full aspect-square">
        <MissionImage imageUrl={effectiveImageUrl} className="absolute inset-0" />
      </div>

      {children}
    </>
  );
}

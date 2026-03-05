"use client";

import { MissionImage } from "@/app/(site)/mission/[missionId]/components/MissionImage";
import { UserAvatar } from "@/components/common/UserAvatar";
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
      <div className="relative w-full aspect-square">
        <MissionImage imageUrl={effectiveImageUrl} className="absolute inset-0" />
      </div>

      <div className="relative z-10 -mt-5 flex flex-col items-center w-full px-5">
        <div
          ref={titleRef}
          className="flex w-full flex-col items-center gap-0.5 rounded-2xl bg-white p-4 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]"
        >
          {subtitle && (
            <Typo.Body size="small" className="text-zinc-500">
              {subtitle}
            </Typo.Body>
          )}
          <div className="break-keep text-center">
            <Typo.MainTitle size="small" className="inline line-clamp-2 text-ellipsis">
              {title}
            </Typo.MainTitle>
            {isRequirePassword && (
              <Lock className="ml-1 inline-block size-5 align-[0.1em] text-zinc-400" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-5">
        {authorName ? (
          <div className="flex items-center gap-1">
            <UserAvatar size="small" imageUrl={authorImageUrl} />
            <Typo.Body size="medium">{authorName}</Typo.Body>
          </div>
        ) : (
          <div />
        )}
        <Typo.Body size="small" className="text-zinc-400">
          조회 {formatCompactNumber(viewCount)} · 찜 {formatCompactNumber(likesCount)}
        </Typo.Body>
      </div>

      <div className="mx-5 h-px bg-zinc-100" />

      {children}
    </>
  );
}

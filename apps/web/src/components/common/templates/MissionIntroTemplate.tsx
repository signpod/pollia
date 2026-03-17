"use client";

import { MissionImage } from "@/app/(site)/mission/[missionId]/components/MissionImage";
import { UserAvatar } from "@/components/common/UserAvatar";
import { WHITE_LABEL_PREFIX } from "@/constants/routes";
import { formatCompactNumber } from "@/lib/format";
import Lock from "@public/svgs/lock.svg";
import { Typo } from "@repo/ui/components";
import { usePathname } from "next/navigation";
import type { ReactNode, RefObject } from "react";

export interface MissionIntroTemplateProps {
  header?: ReactNode;
  imageUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  authorName?: string | null;
  authorImageUrl?: string | null;
  isRequirePassword?: boolean;
  startDate?: Date | null;
  deadline?: Date | null;
  viewCount?: number;
  likesCount?: number;
  titleRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
}

function formatDateRange(startDate?: Date | null, deadline?: Date | null): string | null {
  if (!startDate && !deadline) return null;

  const format = (date: Date) => {
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  if (startDate && deadline)
    return `${format(new Date(startDate))} - ${format(new Date(deadline))}`;
  if (startDate) return `${format(new Date(startDate))} ~`;
  return `~ ${format(new Date(deadline!))}`;
}

export function MissionIntroTemplate({
  imageUrl,
  title,
  subtitle,
  authorName,
  authorImageUrl,
  isRequirePassword,
  startDate,
  deadline,
  viewCount = 0,
  likesCount = 0,
  titleRef,
  children,
}: MissionIntroTemplateProps) {
  const pathname = usePathname();
  const isWhiteLabel = pathname.startsWith(`${WHITE_LABEL_PREFIX}/`);
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
          <div className="flex flex-col items-center">
            <div className="break-keep text-center">
              <Typo.MainTitle size="small" className="inline line-clamp-2 text-ellipsis">
                {title}
              </Typo.MainTitle>
              {isRequirePassword && (
                <Lock className="ml-1 inline-block size-5 align-[0.1em] text-zinc-400" />
              )}
            </div>
            {formatDateRange(startDate, deadline) && (
              <Typo.Body size="small" className="text-zinc-500">
                {formatDateRange(startDate, deadline)}
              </Typo.Body>
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
        {!isWhiteLabel && (
          <Typo.Body size="small" className="text-zinc-400">
            조회 {formatCompactNumber(viewCount)} · 찜 {formatCompactNumber(likesCount)}
          </Typo.Body>
        )}
      </div>

      <div className="mx-5 h-px bg-zinc-100" />

      {children}
    </>
  );
}

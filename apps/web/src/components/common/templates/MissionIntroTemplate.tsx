"use client";

import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { MissionImage } from "@/app/(site)/mission/[missionId]/components/MissionImage";
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
  titleRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
}

export function MissionIntroTemplate({
  header,
  imageUrl,
  missionId,
  title,
  subtitle,
  authorName,
  authorImageUrl,
  isRequirePassword,
  titleRef,
  children,
}: MissionIntroTemplateProps) {
  const effectiveImageUrl = imageUrl || "/images/intro-fallback.png";

  return (
    <>
      {header}
      <div className="relative w-full aspect-square">
        <MissionImage imageUrl={effectiveImageUrl} className="absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
        <div
          ref={titleRef}
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 px-5 pb-5"
        >
          {subtitle && (
            <Typo.Body size="small" className="text-white">
              {subtitle}
            </Typo.Body>
          )}
          <div className="break-keep text-white">
            <Typo.MainTitle size="large" className="inline text-white drop-shadow-sm">
              {title}
            </Typo.MainTitle>
            {isRequirePassword && (
              <Lock className="ml-1 inline-block size-5 align-[0.1em] text-white" />
            )}
          </div>
          <div className="flex items-center justify-between pt-0.5">
            {authorName ? (
              <div className="flex items-center gap-1.5">
                {authorImageUrl && (
                  <img src={authorImageUrl} alt="" className="size-5 rounded-full object-cover" />
                )}
                <Typo.Body size="medium" className="text-white">
                  {authorName}
                </Typo.Body>
              </div>
            ) : (
              <div />
            )}
            {missionId && <MissionLikeButton missionId={missionId} />}
          </div>
        </div>
      </div>

      {children}
    </>
  );
}

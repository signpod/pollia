"use client";

import { MissionShareSection } from "@/app/(site)/mission/[missionId]/components/MissionShareSection";
import { cleanTiptapHTML } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import Image from "next/image";
import type { ReactNode } from "react";

export interface MissionCompletionTemplateProps {
  header?: ReactNode;
  imageUrl?: string | null;
  missionTitle?: string | null;
  title?: string;
  description?: string;
  reward?: ReactNode;
  shareButtons?: ReactNode;
}

export function MissionCompletionTemplate({
  header,
  imageUrl,
  missionTitle,
  title,
  description,
  reward,
  shareButtons,
}: MissionCompletionTemplateProps) {
  return (
    <div className="relative w-full bg-white min-h-svh">
      {header}
      <div className="flex w-full flex-col items-center gap-10 px-5 pt-5 pb-10">
        {imageUrl && (
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-[0px_4px_20px_0px_rgba(9,9,11,0.16)]">
            <Image
              src={imageUrl}
              alt="Completion Image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex w-full flex-col items-center gap-1">
          {missionTitle && (
            <Typo.Body size="medium" className="w-full truncate text-center text-zinc-500">
              {missionTitle}
            </Typo.Body>
          )}
          {title && (
            <Typo.MainTitle size="large" className="break-keep text-center">
              {title}
            </Typo.MainTitle>
          )}
        </div>

        <div className="mx-5 h-px w-full bg-zinc-100" />

        <div className="flex w-full flex-col gap-10">
          {description && cleanTiptapHTML(description) && (
            <TiptapViewer content={cleanTiptapHTML(description)} className="w-full break-keep" />
          )}

          {reward}

          {shareButtons && <MissionShareSection shareButtons={shareButtons} />}
        </div>
      </div>
    </div>
  );
}

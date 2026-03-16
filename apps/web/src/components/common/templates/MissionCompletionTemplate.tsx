"use client";

import { MissionShareSection } from "@/app/(site)/mission/[missionId]/components/MissionShareSection";
import { cleanTiptapHTML } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import { DownloadIcon, Loader2Icon } from "lucide-react";
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
  recommendation?: ReactNode;
  completionLinks?: ReactNode;
  purchaseLinks?: ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

export function MissionCompletionTemplate({
  header,
  imageUrl,
  missionTitle,
  title,
  description,
  reward,
  shareButtons,
  recommendation,
  completionLinks,
  purchaseLinks,
  onSave,
  isSaving,
  canSave,
}: MissionCompletionTemplateProps) {
  return (
    <div className="relative w-full bg-white flex-1 pb-10">
      {header}
      <div className="flex w-full flex-col gap-[60px] pb-10">
        <div className="flex w-full flex-col items-end gap-10 px-5">
          <div className="flex w-full flex-col gap-5">
            {shareButtons && <MissionShareSection shareButtons={shareButtons} />}

            <div className="flex w-full flex-col items-center gap-10">
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

              <div className="flex w-full flex-col items-center gap-3">
                <div className="flex w-full flex-col items-center gap-1">
                  {missionTitle && (
                    <Typo.Body size="large" className="w-full truncate text-center text-zinc-500">
                      {missionTitle}
                    </Typo.Body>
                  )}
                  {title && (
                    <Typo.MainTitle size="medium" className="break-keep text-center">
                      {title}
                    </Typo.MainTitle>
                  )}
                </div>

                {canSave && (
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2"
                  >
                    {isSaving ? (
                      <Loader2Icon className="size-4 animate-spin text-zinc-500" />
                    ) : (
                      <DownloadIcon className="size-4 text-zinc-500" />
                    )}
                    <Typo.ButtonText size="medium" className="text-zinc-500">
                      결과 카드 저장
                    </Typo.ButtonText>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-10">
            {description && cleanTiptapHTML(description) && (
              <TiptapViewer content={cleanTiptapHTML(description)} className="w-full break-keep" />
            )}

            {completionLinks}

            {purchaseLinks}

            {/* reward 일단 임시로 주석처리 */}
            {/* {reward} */}
          </div>
        </div>

        {recommendation}
      </div>
    </div>
  );
}

"use client";

import { cleanTiptapHTML } from "@/lib/utils";
import { ButtonV2, Typo } from "@repo/ui/components";
import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Ellipsis, Share2, Upload } from "lucide-react";
import Image from "next/image";
import type { RefObject } from "react";

export interface MissionCompletionTemplateProps {
  imageUrl?: string | null;
  title?: string;
  description?: string;

  imageMenu?: {
    isOpen: boolean;
    menuRef: RefObject<HTMLDivElement | null>;
    onToggle: () => void;
    onSave: () => void;
    onShare: () => void;
  };

  onShare?: () => void;
}

export function MissionCompletionTemplate({
  imageUrl,
  title,
  description,
  imageMenu,
  onShare,
}: MissionCompletionTemplateProps) {
  return (
    <div className="flex w-full flex-col items-center gap-10 px-5 pt-5 pb-10">
      {imageUrl && (
        <div className="relative w-full overflow-hidden rounded-[28px] shadow-[0_4px_20px_rgba(9,9,11,0.16)]">
          <Image
            src={imageUrl}
            alt="Completion Image"
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="h-auto w-full object-contain"
            priority
          />
          {imageMenu && (
            <div
              ref={imageMenu.menuRef}
              className="absolute right-4 top-4 flex flex-col items-end gap-2"
            >
              <button
                type="button"
                className="rounded-xl border border-zinc-100 bg-white p-3"
                onClick={imageMenu.onToggle}
              >
                <Ellipsis className="size-5 text-zinc-900" />
              </button>
              <AnimatePresence>
                {imageMenu.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="origin-top-right flex flex-col gap-1 rounded-xl bg-white p-2 shadow-[0_4px_20px_rgba(9,9,11,0.16)]"
                  >
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      onClick={imageMenu.onSave}
                    >
                      <Download className="size-4 text-zinc-950" />
                      <Typo.ButtonText size="medium">이미지 저장</Typo.ButtonText>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      onClick={imageMenu.onShare}
                    >
                      <Upload className="size-4 text-zinc-950" />
                      <Typo.ButtonText size="medium">이미지 공유</Typo.ButtonText>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-4 text-center">
        {title && (
          <Typo.MainTitle size="large" className="break-keep">
            {title}
          </Typo.MainTitle>
        )}
        {description && cleanTiptapHTML(description) && (
          <TiptapViewer content={cleanTiptapHTML(description)} className="text-center break-keep" />
        )}
      </div>

      {onShare && (
        <ButtonV2
          variant="tertiary"
          leftIcon={Share2}
          onClick={onShare}
          className="rounded-4xl px-6 py-4 bg-zinc-100 text-default"
        >
          <Typo.ButtonText size="large">미션 공유</Typo.ButtonText>
        </ButtonV2>
      )}
    </div>
  );
}

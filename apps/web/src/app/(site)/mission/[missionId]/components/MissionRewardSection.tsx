"use client";
import { AdaptiveImage } from "@/components/common/AdaptiveImage";
import { Dialog, DialogContent, DialogPortal, DialogTitle, Typo } from "@repo/ui/components";
import { formatDate } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MissionRewardSectionProps {
  rewardImageUrl?: string;
  rewardName?: string;
  rewardDescription?: string;
  rewardScheduledDate?: Date;
}

export function MissionRewardSection({
  rewardImageUrl,
  rewardName,
  rewardDescription,
  rewardScheduledDate,
}: MissionRewardSectionProps) {
  const [formattedScheduledDate, setFormattedScheduledDate] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (rewardScheduledDate) {
      setFormattedScheduledDate(formatDate(rewardScheduledDate, "yy.MM.dd"));
    }
  }, [rewardScheduledDate]);

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-2 py-3 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      <div className="flex flex-1 flex-col items-center gap-2">
        {rewardImageUrl && (
          <>
            <button
              type="button"
              onClick={() => setIsImageOpen(true)}
              className="size-[120px] overflow-hidden rounded-xl bg-zinc-50 cursor-pointer"
            >
              <AdaptiveImage src={rewardImageUrl} alt="reward" className="size-full rounded-xl" />
            </button>
            <AnimatePresence>
              {isImageOpen && (
                <Dialog open={isImageOpen} onOpenChange={setIsImageOpen} modal={false}>
                  <DialogPortal>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200"
                      data-state={isImageOpen ? "open" : "closed"}
                      onClick={() => setIsImageOpen(false)}
                      onKeyDown={undefined}
                    />
                    <DialogContent className="flex items-center justify-center bg-transparent p-6 shadow-none max-w-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200">
                      <DialogTitle className="sr-only">리워드 이미지</DialogTitle>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center p-2 bg-white rounded-xl w-full"
                      >
                        <div className="relative w-full aspect-square select-none pointer-events-none">
                          <Image
                            src={rewardImageUrl}
                            alt="reward"
                            fill
                            className="rounded-xl object-contain select-none pointer-events-none"
                            draggable={false}
                          />
                        </div>
                      </motion.div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
              )}
            </AnimatePresence>
          </>
        )}
        <div className="flex flex-col items-center w-full text-center">
          {rewardName && (
            <Typo.SubTitle size="large" className="truncate w-full">
              {rewardName}
            </Typo.SubTitle>
          )}
          {rewardDescription && (
            <Typo.Body size="medium" className="truncate w-full text-zinc-500">
              {rewardDescription}
            </Typo.Body>
          )}
        </div>
        {formattedScheduledDate && (
          <div className="rounded-[6px] border border-zinc-200 px-2 py-1">
            <Typo.Body size="small" className="text-zinc-500">
              {`${formattedScheduledDate} 순차 지급`}
            </Typo.Body>
          </div>
        )}
      </div>
    </div>
  );
}

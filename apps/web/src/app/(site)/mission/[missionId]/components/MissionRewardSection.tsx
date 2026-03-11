"use client";
import { AdaptiveImage } from "@/components/common/AdaptiveImage";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "@repo/ui/components";
import { Typo } from "@repo/ui/components";
import { formatDate } from "date-fns";
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
              className="size-[120px] overflow-hidden rounded-xl bg-zinc-50 p-2 cursor-pointer"
            >
              <AdaptiveImage src={rewardImageUrl} alt="reward" className="size-full rounded-xl" />
            </button>
            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen} modal={false}>
              <DialogPortal>
                <div
                  className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200"
                  data-state={isImageOpen ? "open" : "closed"}
                  onClick={() => setIsImageOpen(false)}
                  onKeyDown={undefined}
                />
                <DialogContent className="flex items-center justify-center bg-transparent p-6 shadow-none max-w-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200">
                  <DialogTitle className="sr-only">리워드 이미지</DialogTitle>
                  <div className="relative w-full aspect-square">
                    <Image
                      src={rewardImageUrl}
                      alt="reward"
                      fill
                      className="rounded-xl object-contain"
                    />
                  </div>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </>
        )}
        <div className="flex flex-col items-center">
          {rewardName && (
            <Typo.SubTitle size="large" className="text-center">
              {rewardName}
            </Typo.SubTitle>
          )}
          {rewardDescription && (
            <Typo.Body size="medium" className="text-center text-zinc-400">
              {rewardDescription}
            </Typo.Body>
          )}
          {formattedScheduledDate && (
            <Typo.Body size="medium" className="text-center text-zinc-400 pt-4">
              {`${formattedScheduledDate} 순차 지급`}
            </Typo.Body>
          )}
        </div>
      </div>
    </div>
  );
}

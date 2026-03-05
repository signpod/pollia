"use client";

import { ROUTES } from "@/constants/routes";
import { Typo } from "@repo/ui/components";
import { useEffect, useState } from "react";

interface EditorDesktopMobilePanelProps {
  missionId: string;
}

const DEVICE_SIZE = {
  width: 393,
  height: 852,
};

export function EditorDesktopMobilePanel({ missionId }: EditorDesktopMobilePanelProps) {
  const previewUrl = ROUTES.MISSION(missionId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (previewUrl) {
      setIsLoading(true);
    }
  }, [previewUrl]);

  return (
    <section className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_10px_40px_rgba(9,9,11,0.08)]">
      <header className="px-1">
        <Typo.Body size="medium" className="font-semibold text-zinc-900">
          모바일 미리보기
        </Typo.Body>
        <Typo.Body size="small" className="mt-1 text-zinc-500">
          실제 사용자 화면 기준
        </Typo.Body>
      </header>

      <div className="mt-3 flex min-h-0 flex-1 items-start justify-center overflow-auto pb-2">
        <div
          className="rounded-[40px] bg-zinc-900 p-3 shadow-2xl"
          style={{
            width: DEVICE_SIZE.width + 24,
            minWidth: DEVICE_SIZE.width + 24,
            height: DEVICE_SIZE.height + 24,
            minHeight: DEVICE_SIZE.height + 24,
          }}
        >
          <div
            className="relative overflow-hidden rounded-[28px] bg-white"
            style={{
              width: DEVICE_SIZE.width,
              height: DEVICE_SIZE.height,
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                <div className="size-7 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-500" />
              </div>
            )}
            <iframe
              title="모바일 미리보기"
              src={previewUrl}
              className="h-full w-full border-0"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useEffect, useState } from "react";

interface MobilePreviewPanelProps {
  url: string;
}

const DEVICE_SIZE = { width: 393, height: 852 };

export function MobilePreviewPanel({ url }: MobilePreviewPanelProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    if (url) {
      setIframeLoading(true);
    }
  }, [url]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-[40px] bg-zinc-900 p-3"
        style={{
          width: DEVICE_SIZE.width + 24,
          height: DEVICE_SIZE.height + 24,
        }}
      >
        <div
          className="relative flex flex-col overflow-hidden rounded-[28px]"
          style={{
            width: DEVICE_SIZE.width,
            height: DEVICE_SIZE.height,
            transform: "translateZ(0)",
          }}
        >
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500" />
            </div>
          )}
          <iframe
            key={url}
            title={`${UBIQUITOUS_CONSTANTS.MISSION} 미리보기`}
            src={url}
            className="h-full w-full border-0 overflow-y-scroll"
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}

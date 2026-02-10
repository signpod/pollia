"use client";

import { cn } from "@/app/admin/lib/utils";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface IntroMobilePreviewPlaceholderProps {
  imageUrl?: string | null;
  brandLogoUrl?: string | null;
  title?: string;
  deadline?: Date | null;
}

export function IntroMobilePreviewPlaceholder({
  imageUrl,
  brandLogoUrl,
  title,
  deadline,
}: IntroMobilePreviewPlaceholderProps) {
  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : null;

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Mission Preview"
          fill
          className="object-cover object-top"
          sizes="393px"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
          <ImageIcon className="h-16 w-16 text-zinc-600 mb-4" />
          <p className="text-zinc-500 text-sm">미션 이미지를 설정해주세요</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-linear-to-t from-black via-black/50 to-transparent pb-6 pt-16 px-5">
        <div className="flex flex-col gap-3 justify-center items-center">
          {brandLogoUrl && (
            <div className="relative size-15 rounded-full overflow-hidden ring-1 ring-zinc-200 bg-white shrink-0">
              <Image
                src={brandLogoUrl}
                alt="Brand Logo"
                fill
                sizes="60px"
                className="object-contain"
              />
            </div>
          )}

          <div className="flex flex-col gap-1 justify-center items-center">
            <h1 className="text-white text-center text-xl font-bold break-keep">
              {title || "미션 제목을 입력해주세요"}
            </h1>
            {formattedDeadline && <p className="text-zinc-300 text-sm">{formattedDeadline} 까지</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <div className="flex justify-between items-center bg-black/40 rounded-md p-3 h-[50px]">
            <span className="text-zinc-400 text-sm">완료 리워드</span>
            <span className="text-white text-sm font-medium">리워드 정보</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-white/70">
          <span className="text-sm">아래로 내려보세요</span>
        </div>
      </div>

      <div className={cn("absolute top-4 left-0 right-0 z-20", "flex justify-center")}>
        <div className="bg-amber-500/90 text-black text-xs font-medium px-3 py-1.5 rounded-full">
          여기에 프론트오피스 인트로 컴포넌트를 연결하세요
        </div>
      </div>
    </div>
  );
}

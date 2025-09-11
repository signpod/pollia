"use client";
import { BottomCTALayout, Button } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import Link from "next/link";

const TEMP_POLL_ID = "포근한 폴리안";

export default function LoginDonePage() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <PolliaIcon className="size-22 text-primary" />
        <div className="text-center text-xl whitespace-pre-line font-bold">
          <span className="text-primary">{TEMP_POLL_ID}</span>
          님, \n 만나서 반가워요!
        </div>
      </div>

      <BottomCTALayout.CTA className="w-full flex justify-center bg-white">
        <div className="flex flex-col justify-center w-full max-w-lg px-5 mb-10">
          <Link href="/create" className="w-full">
            <Button
              className={cn(
                "w-full box-border rounded-lg color-zinc-800 h-11",
                "px-6 flex justify-between",
                "bg-zinc-800"
              )}
              aria-label="첫 폴 만들러 가기"
            >
              <div className="font-bold leading-1.5 text-center flex-1 text-[16px] text-white">
                첫 폴 만들러 가기
              </div>
            </Button>
          </Link>
        </div>
      </BottomCTALayout.CTA>
    </>
  );
}

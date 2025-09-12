"use client";
import { BottomCTALayout, Button, Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import Link from "next/link";

const TEMP_POLL_ID = "포근한 폴리안";

export default function LoginDonePage() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 mb-[160px]">
        <Image
          src="/svgs/pollia-icon.svg"
          alt="Pollia Icon"
          width={88}
          height={88}
          className="text-primary"
        />
        <Typo.MainTitle
          size="small"
          className="text-center whitespace-pre-line font-bold"
        >
          <span className="text-primary">{TEMP_POLL_ID}</span>
          {`님, \n 만나서 반가워요!`}
        </Typo.MainTitle>
      </div>

      <BottomCTALayout.CTA className="w-full flex justify-center bg-white">
        <div className="flex flex-col justify-center w-full max-w-lg px-5 mb-10">
          <Link href="/create" className="w-full">
            <Button
              className={cn("w-full box-border color-zinc-800", "bg-zinc-800")}
              aria-label="첫 폴 만들러 가기"
            >
              <Typo.ButtonText size="large">첫 폴 만들러 가기</Typo.ButtonText>
            </Button>
          </Link>
        </div>
      </BottomCTALayout.CTA>
    </>
  );
}

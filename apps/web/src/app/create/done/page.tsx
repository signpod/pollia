"use client";
import { BottomCTALayout, Button, Typo } from "@repo/ui/components";
import PolliaIcon from "@public/svgs/poll-poll-e.svg";
import Link from "next/link";
import { motion } from "framer-motion";

const TEMP_POLL_ID = "1";
const CREATE_POLL_DONE_MESSAGE = "폴이 성공적으로 만들어졌어요\n어떤 결과가 나올지 같이 기다려봐요!";

export default function LoginDonePage() {
  return (
    <div className="mt-60">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 mb-[160px]">
        <PolliaIcon className="text-primary size-30" />

        <Typo.MainTitle size="small" className="text-center whitespace-pre-line font-bold">
          {CREATE_POLL_DONE_MESSAGE}
        </Typo.MainTitle>
      </div>

      <BottomCTALayout.CTA className="w-full flex justify-center bg-white">
        <motion.div
          className="flex flex-col justify-center w-full max-w-lg px-5 mb-10 gap-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <Button className="w-full" aria-label="만든 폴 링크 복사하기">
            <Typo.ButtonText size="large">만든 폴 링크 복사하기</Typo.ButtonText>
          </Button>

          <Link href={`/poll/${TEMP_POLL_ID}`} className="w-full">
            <Button className="w-full" variant="secondary" aria-label="지금 바로 확인하기">
              <Typo.ButtonText size="large">지금 바로 확인하기</Typo.ButtonText>
            </Button>
          </Link>
        </motion.div>
      </BottomCTALayout.CTA>
    </div>
  );
}

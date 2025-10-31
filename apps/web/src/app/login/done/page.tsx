"use client";

import PolliaIcon from "@public/svgs/poll-poll-e.svg";
import { Button, FixedBottomLayout, Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { motion } from "framer-motion";
import Link from "next/link";

const TEMP_POLL_ID = "포근한 폴리안";

export default function LoginDonePage() {
  return (
    <>
      <div className="mb-[160px] flex flex-1 flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ x: "-100vw", rotate: -560 }}
          animate={{ x: 0, rotate: 0 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 50,
            duration: 3,
          }}
        >
          <PolliaIcon className="text-primary size-30" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          <Typo.MainTitle size="small" className="text-center font-bold whitespace-pre-line">
            <span className="text-primary">{TEMP_POLL_ID}</span>
            {"님, \n 만나서 반가워요!"}
          </Typo.MainTitle>
        </motion.div>
      </div>

      <FixedBottomLayout.Content className="flex w-full justify-center bg-white">
        <motion.div
          className="flex w-full max-w-lg flex-col justify-center p-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.2,
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <Link href="/poll/create" className="w-full">
            <Button
              className={cn("color-zinc-800 box-border w-full", "bg-zinc-800")}
              aria-label="첫 폴 만들러 가기"
            >
              <Typo.ButtonText size="large">첫 폴 만들러 가기</Typo.ButtonText>
            </Button>
          </Link>
        </motion.div>
      </FixedBottomLayout.Content>
    </>
  );
}

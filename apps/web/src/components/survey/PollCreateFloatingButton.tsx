"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { PointIcon } from "../common/PointIcon";

interface PollCreateFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export default function PollCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: PollCreateFloatingButtonProps) {
  const showText = variant === "with-text";

  return (
    <button
      className={cn(
        "relative rounded-full bg-zinc-800 shadow-lg",
        "flex items-center justify-center overflow-hidden",
        "transition-all duration-200 active:scale-95",
        className,
      )}
      aria-label="투표 만들기"
      {...props}
    >
      <motion.div
        className="flex items-center justify-center gap-3 p-4"
        animate={{
          gap: showText ? "12px" : "0px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <PointIcon className="size-6 shrink-0 text-white">
          <PlusIcon className="size-4.5 text-zinc-950" strokeWidth={2.8} />
        </PointIcon>

        <motion.div
          className="overflow-hidden"
          animate={{
            width: showText ? "74px" : "0px",
            opacity: showText ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Typo.ButtonText size="large" className="whitespace-nowrap text-white">
            투표 만들기
          </Typo.ButtonText>
        </motion.div>
      </motion.div>
    </button>
  );
}

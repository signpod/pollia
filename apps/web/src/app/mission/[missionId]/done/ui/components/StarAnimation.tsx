"use client";

import { cn } from "@/lib/utils";
import { Tooltip } from "@repo/ui/components";
import StarBigIcon from "@public/svgs/star-big.svg";
import StarYellow from "@public/svgs/star-yellow.svg";
import { motion } from "framer-motion";
import { forwardRef } from "react";

const STAR_COUNT = 5;
const STAR_RADIUS = 120;

function calculateStarPosition(index: number) {
  const angle = -90 + (index - 2) * 30;
  const radian = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radian) * STAR_RADIUS,
    y: Math.sin(radian) * STAR_RADIUS,
  };
}

interface StarAnimationProps {
  showTooltip: boolean;
}

export const StarAnimation = forwardRef<HTMLDivElement, StarAnimationProps>(
  ({ showTooltip }, ref) => {
    return (
      <motion.div
        key="star"
        layoutId="mission-star"
        transition={{
          layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        }}
        className="flex flex-col items-center"
      >
        <Tooltip
          id="star-tooltip"
          className={cn(
            "opacity-0 translate-y-[10px] transition-all duration-300",
            showTooltip ? "opacity-100 translate-y-0" : "",
          )}
        >
          참여해주셔서 감사합니다 ⭐️
        </Tooltip>
        <div
          className="relative pt-[100px] px-[70px] flex items-center justify-center origin-center"
          ref={ref}
          data-tooltip-id="star-tooltip"
        >
          {Array.from({ length: STAR_COUNT }).map((_, i) => {
            const { x, y } = calculateStarPosition(i);
            return (
              <div
                key={`star-${i}`}
                className={cn("absolute left-1/2 top-1/2")}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <StarYellow className={i % 2 === 0 ? "size-10" : "size-8"} />
              </div>
            );
          })}
          <StarBigIcon className="translate-y-[-40px] size-50" />
        </div>
      </motion.div>
    );
  },
);

StarAnimation.displayName = "StarAnimation";


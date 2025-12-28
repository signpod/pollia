"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressBarV2Props {
  value: number;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
  ticActiveColor?: string;
  ticInactiveColor?: string;
}

const TIC_POSITIONS = [0, 25, 50, 75, 100];
const DASHES_PER_SECTION = 5;
const SECTION_SIZE = 25;

const animatedTicsSet = new Set<string>();

export function ProgressBarV2({
  value,
  className,
  activeColor = "bg-yellow-500",
  inactiveColor = "bg-zinc-200",
  ticActiveColor,
  ticInactiveColor,
}: ProgressBarV2Props) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const getNextTicAfterActive = () => {
    const activePositions = TIC_POSITIONS.filter(pos => clampedValue > pos);
    if (activePositions.length === 0) {
      return TIC_POSITIONS[0];
    }
    const lastActivePosition = Math.max(...activePositions);
    const nextIndex = TIC_POSITIONS.indexOf(lastActivePosition) + 1;
    return nextIndex < TIC_POSITIONS.length ? TIC_POSITIONS[nextIndex] : null;
  };

  const getTicState = (position: number) => {
    const nextTicPosition = getNextTicAfterActive();

    if (clampedValue > position) {
      return "active";
    }
    if (nextTicPosition === position) {
      return "current";
    }
    return "inactive";
  };

  const getDashState = (sectionIndex: number, dashIndex: number) => {
    const sectionStart = sectionIndex * SECTION_SIZE;
    const dashStart = sectionStart + dashIndex * (SECTION_SIZE / DASHES_PER_SECTION);
    const dashEnd = dashStart + SECTION_SIZE / DASHES_PER_SECTION;

    if (clampedValue >= dashEnd) {
      return "full";
    }
    if (clampedValue > dashStart) {
      return "partial";
    }
    return "empty";
  };

  const getDashFillPercentage = (sectionIndex: number, dashIndex: number) => {
    const sectionStart = sectionIndex * SECTION_SIZE;
    const dashStart = sectionStart + dashIndex * (SECTION_SIZE / DASHES_PER_SECTION);
    const dashEnd = dashStart + SECTION_SIZE / DASHES_PER_SECTION;

    if (clampedValue <= dashStart) {
      return 0;
    }
    if (clampedValue >= dashEnd) {
      return 100;
    }

    const dashProgress = ((clampedValue - dashStart) / (dashEnd - dashStart)) * 100;
    return dashProgress;
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        {TIC_POSITIONS.map((position, index) => {
          const isActive = getTicState(position) === "active";
          const isLast = index === TIC_POSITIONS.length - 1;
          const isCurrent = getTicState(position) === "current";

          return (
            <React.Fragment key={position}>
              {isActive ? (
                <CheckTick
                  key={`check-${position}`}
                  layoutId={`tic-${position}`}
                  activeColor={ticActiveColor || activeColor}
                />
              ) : isCurrent ? (
                <CurrentTick
                  key={`current-${position}`}
                  activeColor={ticActiveColor || activeColor}
                />
              ) : (
                <Tick key={`tick-${position}`} inactiveColor={ticInactiveColor || inactiveColor} />
              )}

              {!isLast && (
                <div className="flex-1 flex items-center gap-0.5 mx-1">
                  {Array.from({ length: DASHES_PER_SECTION }).map((_, dashIndex) => {
                    const dashState = getDashState(index, dashIndex);
                    const fillPercentage = getDashFillPercentage(index, dashIndex);

                    return (
                      <div
                        key={`dash-${index}-${dashIndex}`}
                        className="relative h-[2px] flex-1 overflow-hidden rounded"
                      >
                        <div
                          className={cn(
                            "h-full transition-all duration-300 rounded",
                            dashState === "full" || dashState === "partial"
                              ? activeColor
                              : inactiveColor,
                          )}
                          style={{
                            width: dashState === "partial" ? `${fillPercentage}%` : "100%",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function CheckTick({
  layoutId,
  activeColor,
}: {
  layoutId: string;
  activeColor: string;
}) {
  const shouldAnimate = React.useRef(!animatedTicsSet.has(layoutId));

  React.useEffect(() => {
    if (shouldAnimate.current) {
      animatedTicsSet.add(layoutId);
    }
  }, [layoutId]);

  return (
    <motion.div
      layoutId={layoutId}
      initial={shouldAnimate.current ? { opacity: 0, scale: 0 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "size-7 rounded-full flex items-center justify-center m-[-8px] shadow-[0_2px_4px_0_rgba(197,95,0,0.2)] inset-shadow-[0_2px_3px_0_rgba(197,95,0,0.2)]",
        activeColor,
      )}
    >
      <CheckIcon className="size-3 text-white" />
    </motion.div>
  );
}

function Tick({ inactiveColor }: { inactiveColor: string }) {
  return <div className={cn("size-[10px] rounded-full", inactiveColor)} />;
}

function CurrentTick({ activeColor }: { activeColor: string }) {
  const getBgWithOpacity = (color: string) => {
    if (color.includes("yellow-500")) return "bg-yellow-500/20";
    if (color.includes("blue-500")) return "bg-blue-500/20";
    if (color.includes("violet-500")) return "bg-violet-500/20";
    return "bg-yellow-500/20";
  };

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.8 }}
      animate={{ scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 1.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      className={cn(
        "size-7 rounded-full flex items-center justify-center m-[-8.5px]",
        getBgWithOpacity(activeColor),
      )}
    >
      <div className={cn("size-[10px] rounded-full", activeColor)} />
    </motion.div>
  );
}

"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CenterOverlay, Typo } from "@repo/ui/components";
import Image from "next/image";

interface PollOptionProgressiveProps {
  icon?: LucideIcon;
  label: string;
  percentage: number;
  selected?: boolean;
  className?: string;
  imageUrl?: string;
}

export function PollOptionProgressive({
  icon: Icon,
  label,
  percentage,
  selected = false,
  imageUrl,
  className,
}: PollOptionProgressiveProps) {
  const progressWidth = React.useMemo(() => {
    return Math.min(Math.max(percentage, 0), 100);
  }, [percentage]);

  const textColor = selected ? "text-violet-500" : "text-zinc-500";
  const progressColor = selected ? "bg-violet-100" : "bg-zinc-200";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-neutral-50 p-4",
        "transition-all duration-200 ease-out",
        "transition-colors duration-200",
        "flex justify-between",
        "gap-2",
        className
      )}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemax={100}
      aria-label={`${label} ${percentage}%`}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full transition-all duration-300 ease-out",

          progressColor
        )}
        style={{
          width: `${progressWidth}%`,
        }}
      />

      <div className={cn("relative flex items-center gap-3", "flex-1")}>
        {Icon && (
          <CenterOverlay
            targetElement={
              <div className="flex size-6 items-center justify-center" />
            }
          >
            <Icon className={cn("size-6", textColor)} />
          </CenterOverlay>
        )}

        <Typo.ButtonText size="large" className={cn("flex-1", textColor)}>
          {label}
        </Typo.ButtonText>

        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          animate={{
            x: selected ? -32 : 0,
          }}
          transition={{
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.05,
          }}
        >
          <Typo.ButtonText size="medium" className={cn(textColor)}>
            {percentage}%
          </Typo.ButtonText>
        </motion.div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-200">
          {selected && <AnimatedCheck className={cn("h-6 w-6", textColor)} />}
        </div>
      </div>

      {imageUrl && (
        <div className="relative w-8 h-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 size-10 rounded-xs overflow-hidden">
            <Image src={imageUrl} alt="image" width={40} height={40} />
          </div>
        </div>
      )}
    </div>
  );
}

interface AnimatedCheckProps {
  className?: string;
}

function AnimatedCheck({ className }: AnimatedCheckProps) {
  const [isAnimated, setIsAnimated] = React.useState(false);
  const [pathLength, setPathLength] = React.useState(20);
  const checkRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (checkRef.current) {
      const pathElement = checkRef.current.querySelector("path");
      if (pathElement) {
        const length = pathElement.getTotalLength();
        setPathLength(Math.ceil(length));
      }
    }
  }, []);

  React.useEffect(() => {
    if (pathLength > 0) {
      const timer = setTimeout(() => setIsAnimated(true), 50);
      return () => clearTimeout(timer);
    }
  }, [pathLength]);

  const animationProps = {
    initial: { opacity: 0, width: 0 },
    animate: { opacity: 1, width: "100%" },
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
    className: cn(className, "h-6 w-6"),
  };

  const checkProps = {
    ref: checkRef,
    strokeWidth: 2,
    style: {
      strokeDasharray: `${pathLength}`,
      strokeDashoffset: isAnimated ? "0" : `-${pathLength}`,
      transition: "stroke-dashoffset 0.15s cubic-bezier(.34,.98,.16,0)",
      transitionDelay: "0.1s",
    } as React.CSSProperties,
  };

  return (
    <motion.div {...animationProps}>
      <Check {...checkProps} />
    </motion.div>
  );
}

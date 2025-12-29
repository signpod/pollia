"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Loader2Icon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

type Variant = "default" | "error" | "loading";
interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  containerClassName?: string;
  indicatorClassName?: string;
  variant?: Variant;
  badgeVariant?: BadgeVariant;
  isBadgeVisible?: boolean;
}

export function ProgressBarV2({
  containerClassName,
  indicatorClassName,
  badgeVariant,
  variant,
  isBadgeVisible = false,
  value,
  ...props
}: ProgressBarProps) {
  const PROGRESSBAR_VARIANT: Record<BadgeVariant, Variant> = {
    success: "default",
    error: "error",
    loading: "loading",
  };

  const getProgressbarVariant = (): Variant => {
    if (badgeVariant) {
      return PROGRESSBAR_VARIANT[badgeVariant];
    }
    if (variant && variant !== "default") {
      const variantToBadgeVariant: Record<Exclude<Variant, "default">, BadgeVariant> = {
        error: "error",
        loading: "loading",
      };
      return PROGRESSBAR_VARIANT[variantToBadgeVariant[variant]];
    }
    return "default";
  };

  const progressbarVariant = getProgressbarVariant();
  const shouldShowBadge = badgeVariant && isBadgeVisible;

  return (
    <div className="flex flex-col gap-2 w-full justify-center items-center">
      <AnimatePresence key={badgeVariant}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: shouldShowBadge ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="min-h-[28px]"
        >
          {badgeVariant && <Badge variant={badgeVariant} isVisible={isBadgeVisible} />}
        </motion.div>
      </AnimatePresence>
      <ProgressPrimitive.Root
        className={cn(
          "bg-zinc-100 relative h-[6px] w-[120px] overflow-hidden rounded-xl",
          containerClassName,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all rounded-xl",
            indicatorClassName,
            progressbarVariant === "default" && "bg-violet-500",
            progressbarVariant === "error" && "bg-red-500",
            progressbarVariant === "loading" && "bg-zinc-300",
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}

type BadgeVariant = "success" | "error" | "loading";
interface BadgeProps {
  variant: BadgeVariant;
  isVisible: boolean;
}

const BADGE_TEXT: Record<BadgeVariant, string> = {
  success: "저장 완료",
  error: "오류 발생",
  loading: "저장 중",
};

const BADGE_ICON: Record<BadgeVariant, null | React.ComponentType<React.SVGProps<SVGSVGElement>>> =
  {
    success: Check,
    error: AlertCircle,
    loading: Loader2Icon,
  };

function Badge({ variant, isVisible }: BadgeProps) {
  const Icon = BADGE_ICON[variant];
  return (
    <div
      className={cn(
        "flex justify-center items-center gap-1 px-3 py-1",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-4",
            variant === "loading" && "animate-spin text-info",
            variant === "success" && "text-point",
            variant === "error" && "text-error",
          )}
        />
      )}
      <Typo.Body
        size="medium"
        className={cn(
          variant === "success" && "text-point",
          variant === "error" && "text-error",
          variant === "loading" && "text-info",
        )}
      >
        {BADGE_TEXT[variant]}
      </Typo.Body>
    </div>
  );
}

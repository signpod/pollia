"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Loader2Icon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

type Variant = "default" | "error" | "loading";
type BadgeVariant = "success" | "error" | "loading";

const PROGRESS_BAR_SIZES = {
  height: "h-[6px]",
  width: "w-[160px]",
  badgeMinHeight: "min-h-[28px]",
} as const;

const PROGRESSBAR_VARIANT: Record<BadgeVariant, Variant> = {
  success: "default",
  error: "error",
  loading: "loading",
} as const;

const BADGE_COLOR_CLASSES: Record<BadgeVariant, { icon: string; text: string }> = {
  success: { icon: "text-point", text: "text-point" },
  error: { icon: "text-error", text: "text-error" },
  loading: { icon: "text-info", text: "text-info" },
} as const;

interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  containerClassName?: string;
  indicatorClassName?: string;
  variant?: Variant;
  badgeVariant?: BadgeVariant;
  isBadgeVisible?: boolean;
  currentOrder?: number;
  totalOrder?: number;
}

function ProgressBarV2Component({
  containerClassName,
  indicatorClassName,
  badgeVariant,
  variant,
  isBadgeVisible = false,
  currentOrder,
  totalOrder,
  value,
  ...props
}: ProgressBarProps) {
  const currentValue = value ?? 0;

  const progressbarVariant = React.useMemo((): Variant => {
    if (badgeVariant) {
      return PROGRESSBAR_VARIANT[badgeVariant];
    }
    return variant ?? "default";
  }, [badgeVariant, variant]);

  const shouldShowBadge = React.useMemo(() => {
    if (badgeVariant && isBadgeVisible) {
      return true;
    }
    if (!badgeVariant && currentOrder !== undefined && totalOrder !== undefined) {
      return true;
    }
    return false;
  }, [badgeVariant, isBadgeVisible, currentOrder, totalOrder]);

  return (
    <div className="flex flex-col gap-1 w-full justify-center items-center">
      <AnimatePresence key={badgeVariant ?? "no-badge"}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: shouldShowBadge ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={PROGRESS_BAR_SIZES.badgeMinHeight}
        >
          <Badge variant={badgeVariant} currentOrder={currentOrder} totalOrder={totalOrder} />
        </motion.div>
      </AnimatePresence>
      <ProgressPrimitive.Root
        className={cn(
          "bg-zinc-100 relative overflow-hidden rounded-xl",
          PROGRESS_BAR_SIZES.height,
          PROGRESS_BAR_SIZES.width,
          containerClassName,
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full flex-1 rounded-xl",
            indicatorClassName,
            progressbarVariant === "default" && "bg-black",
            progressbarVariant === "error" && "bg-red-500",
            progressbarVariant === "loading" && "bg-zinc-300",
          )}
          style={{
            width: `${currentValue}%`,
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}

export const ProgressBarV2 = React.memo(ProgressBarV2Component);

interface BadgeProps {
  variant?: BadgeVariant;
  currentOrder?: number;
  totalOrder?: number;
}

const BADGE_TEXT: Record<BadgeVariant, string> = {
  success: "저장 완료",
  error: "오류 발생",
  loading: "저장 중",
} as const;

const BADGE_ICON: Record<BadgeVariant, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  success: Check,
  error: AlertCircle,
  loading: Loader2Icon,
} as const;

function Badge({ variant, currentOrder, totalOrder }: BadgeProps) {
  const Icon = variant ? BADGE_ICON[variant] : undefined;
  const colorClasses = variant ? BADGE_COLOR_CLASSES[variant] : undefined;

  return (
    <>
      {variant ? (
        <div className={cn("flex justify-center items-center gap-1 px-3 py-1")}>
          {Icon && (
            <Icon
              className={cn("size-4", variant === "loading" && "animate-spin", colorClasses?.icon)}
            />
          )}
          <Typo.Body size="medium" className={colorClasses?.text}>
            {BADGE_TEXT[variant]}
          </Typo.Body>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-1 px-3 py-1">
          <AnimatePresence
            key={`order-${String(currentOrder ?? "none")}-${String(totalOrder ?? "none")}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Typo.Body size="medium" className="text-info font-extrabold">
                {currentOrder}
              </Typo.Body>
            </motion.div>
          </AnimatePresence>

          <Typo.Body size="medium" className="text-info font-extrabold">
            /
          </Typo.Body>
          <Typo.Body size="medium" className="text-info font-extrabold">
            {totalOrder}
          </Typo.Body>
        </div>
      )}
    </>
  );
}

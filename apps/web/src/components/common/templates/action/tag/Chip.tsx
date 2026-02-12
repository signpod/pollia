import { cn } from "@/lib/utils";
import { Input, Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ChipProps {
  label: string;
  isSelected: boolean;
  isOther?: boolean;
  textValue?: string;
  onTextChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextBlur?: () => void;
  showError?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Chip({
  label,
  isSelected,
  className,
  disabled,
  isOther = false,
  textValue = "",
  onTextChange,
  onTextBlur,
  showError = false,
  onClick,
}: ChipProps) {
  const isOtherExpanded = isOther && isSelected;
  const hasMountedRef = useRef(false);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  if (isOther) {
    return (
      <motion.div
        layout={hasMountedRef.current}
        initial={false}
        onClick={onClick}
        className={cn(
          "ring-1 ring-inset select-none overflow-hidden cursor-pointer",
          isOtherExpanded
            ? "w-full bg-violet-50 ring-point"
            : "w-fit bg-white ring-default hover:bg-zinc-50",
          className,
        )}
        animate={{
          borderRadius: isOtherExpanded ? 12 : 24,
        }}
        transition={{
          layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          borderRadius: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        <motion.div
          layout={hasMountedRef.current}
          className={cn(
            "flex",
            isOtherExpanded ? "flex-col gap-3 px-4 py-3" : "items-center px-4 py-3",
          )}
          transition={{
            layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <motion.div
            layout={hasMountedRef.current}
            className="flex items-center"
            transition={{
              layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            <motion.span layout={hasMountedRef.current ? "position" : false}>
              <Typo.ButtonText
                size="large"
                className={cn(
                  "transition-colors duration-200",
                  isOtherExpanded ? "text-violet-500" : "text-default",
                )}
              >
                {label}
              </Typo.ButtonText>
            </motion.span>
          </motion.div>
          {isOtherExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
            >
              <Input
                placeholder="입력해주세요"
                value={textValue}
                onChange={onTextChange}
                onBlur={onTextBlur}
                onClick={e => e.stopPropagation()}
                errorMessage={showError && !textValue.trim() ? "필수 입력 사항입니다." : undefined}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "select-none flex items-center justify-center px-4 py-3 ring-1 ring-inset rounded-full gap-3 m-0",
        "transition-colors duration-200",
        "hover:bg-zinc-50 active:bg-zinc-200 active:ring-point",
        isSelected
          ? "bg-violet-50 ring-point hover:bg-violet-100 active:bg-violet-200"
          : disabled
            ? "bg-zinc-50 ring-default"
            : "bg-white ring-default",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Typo.ButtonText
        size="large"
        className={cn(isSelected ? "text-violet-500" : disabled ? "text-disabled" : "text-default")}
      >
        {label}
      </Typo.ButtonText>
    </button>
  );
}

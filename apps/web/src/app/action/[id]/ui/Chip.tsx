import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { ComponentProps } from "react";

interface ChipProps extends ComponentProps<"button"> {
  label: string;
  isSelected: boolean;
}

export function Chip({ label, isSelected, className, disabled, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center px-4 py-3 ring-1 ring-inset rounded-full gap-3 m-0",
        isSelected ? "bg-light ring-point" : "bg-white ring-default",
        className,
      )}
      {...props}
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

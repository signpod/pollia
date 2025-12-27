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
        "select-none flex items-center justify-center px-4 py-3 ring-1 ring-inset rounded-full gap-3 m-0",
        "transition-colors duration-200 ease-in-out",
        "hover:bg-zinc-50 active:bg-zinc-200 active:ring-point",
        isSelected
          ? "bg-violet-50 ring-point hover:bg-violet-100 active:bg-violet-200"
          : disabled
            ? "bg-zinc-50 ring-default"
            : "bg-white ring-default",
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

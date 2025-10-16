import { PropsWithChildren } from "react";
import { Typo } from "..";
import { cn } from "../../lib";

interface LabelTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    PropsWithChildren {
  required: boolean;
  disabled?: boolean;
}

export function LabelText({
  children,
  required,
  className,
  disabled,
  ...props
}: LabelTextProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Typo.SubTitle
        size="large"
        className={cn(
          "text-zinc-950",
          disabled && "text-zinc-300",
          "transition-colors"
        )}
      >
        {children}
      </Typo.SubTitle>
      <span
        className={cn(
          "text-sm font-bold text-red-500 transition-opacity",
          required ? (disabled ? "opacity-15" : "opacity-100") : "opacity-0"
        )}
      >
        *
      </span>
    </div>
  );
}

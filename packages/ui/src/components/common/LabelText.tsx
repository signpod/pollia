import { PropsWithChildren } from "react";
import { Typo } from "..";
import { cn } from "../../lib";

interface LabelTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    PropsWithChildren {
  required: boolean;
}

export function LabelText({
  children,
  required,
  className,
  ...props
}: LabelTextProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Typo.SubTitle size="large" className="text-zinc-950">
        {children}
      </Typo.SubTitle>
      {required && <span className="text-sm font-bold text-red-500">*</span>}
    </div>
  );
}

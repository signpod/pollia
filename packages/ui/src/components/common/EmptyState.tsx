import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-10", className)}>
      <div className="flex w-full max-w-80 flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-6">
          {icon}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xl font-bold text-default">{title}</p>
            {description && (
              <div className="text-base font-medium leading-[1.6] text-info">{description}</div>
            )}
          </div>
        </div>
        {action && <div className="w-full">{action}</div>}
      </div>
    </div>
  );
}

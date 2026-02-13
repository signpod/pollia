import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

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
            <Typo.MainTitle size="small">{title}</Typo.MainTitle>
            {description && (
              <Typo.Body size="large" className="text-info">
                {description}
              </Typo.Body>
            )}
          </div>
        </div>
        {action && <div className="w-full">{action}</div>}
      </div>
    </div>
  );
}

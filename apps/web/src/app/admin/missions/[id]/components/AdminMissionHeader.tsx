import type { ReactNode } from "react";

interface AdminMissionHeaderProps {
  title: string;
  description?: string;
  nav?: ReactNode;
  children?: ReactNode;
}

export function AdminMissionHeader({ title, description, nav, children }: AdminMissionHeaderProps) {
  return (
    <header className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
      {nav && <div>{nav}</div>}
    </header>
  );
}

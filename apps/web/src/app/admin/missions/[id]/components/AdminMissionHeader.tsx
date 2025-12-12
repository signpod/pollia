"use client";

import type { ReactNode } from "react";
import { MissionActiveToggle } from "./MissionActiveToggle";

interface AdminMissionHeaderProps {
  title: string;
  description?: string;
  nav?: ReactNode;
  missionId: string;
  isActive: boolean;
}

export function AdminMissionHeader({
  title,
  description,
  nav,
  missionId,
  isActive,
}: AdminMissionHeaderProps) {
  return (
    <header className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <MissionActiveToggle missionId={missionId} isActive={isActive} />
        </div>
      </div>
      {nav && <div>{nav}</div>}
    </header>
  );
}

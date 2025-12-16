"use client";

import { TiptapViewer } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";

interface MissionDescriptionProps {
  content: string;
}

export function MissionDescription({ content }: MissionDescriptionProps) {
  if (!content) return null;

  return (
    <div className="w-full">
      <TiptapViewer
        content={content}
        className={cn("prose prose-sm break-keep", "max-w-none focus:outline-none", "text-sub")}
      />
    </div>
  );
}

"use client";

import { TiptapViewer } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";

interface SurveyDescriptionProps {
  content: string;
}

export function SurveyDescription({ content }: SurveyDescriptionProps) {
  if (!content) return null;

  return (
    <div className="w-full">
      <TiptapViewer
        content={content}
        className={cn("prose prose-sm", "max-w-none focus:outline-none", "text-sub")}
      />
    </div>
  );
}

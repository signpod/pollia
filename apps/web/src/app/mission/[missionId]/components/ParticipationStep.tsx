"use client";

import { Typo } from "@repo/ui/components";
import { Badge } from "lucide-react";

interface ParticipationStepProps {
  stepNumber: number;
  title: string;
  description: string;
}

export function ParticipationStep({ stepNumber, title, description }: ParticipationStepProps) {
  return (
    <div className="flex gap-4 w-full">
      <div className="relative flex items-center justify-center">
        <Badge className="fill-black size-14" />
        <Typo.MainTitle
          size="small"
          className="text-white absolute inset-0 z-20 flex items-center justify-center"
        >
          {stepNumber.toString().padStart(2, "0")}
        </Typo.MainTitle>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <Typo.MainTitle size="small" className="break-keep">
          {title}
        </Typo.MainTitle>
        <Typo.Body size="medium" className="text-info break-keep">
          {description}
        </Typo.Body>
      </div>
    </div>
  );
}

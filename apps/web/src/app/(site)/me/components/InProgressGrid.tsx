"use client";

import type { MyMissionResponse } from "@/types/dto/mission-response";
import { MeContentCard, type MeContentCardVariant } from "./MeContentCard";

function getVariant(response: MyMissionResponse): MeContentCardVariant {
  const { deadline } = response.mission;
  if (deadline && new Date(deadline) < new Date()) return "expired";
  return "in-progress";
}

interface InProgressGridProps {
  responses: MyMissionResponse[];
}

export function InProgressGrid({ responses }: InProgressGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10">
      {responses.map(response => (
        <MeContentCard
          key={response.id}
          response={response}
          variant={getVariant(response)}
          lineClamp={2}
        />
      ))}
    </div>
  );
}

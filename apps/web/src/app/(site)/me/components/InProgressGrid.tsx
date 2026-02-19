"use client";

import type { MyMissionResponse } from "@/types/dto/mission-response";
import { MeProjectCard, type MeProjectCardVariant } from "./MeProjectCard";

function getVariant(response: MyMissionResponse): MeProjectCardVariant {
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
        <MeProjectCard
          key={response.id}
          response={response}
          variant={getVariant(response)}
          lineClamp={2}
        />
      ))}
    </div>
  );
}

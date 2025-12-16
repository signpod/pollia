"use client";

import { Typo } from "@repo/ui/components";

interface ParticipantCountProps {
  current: number;
  max: number;
}

export function ParticipantCount({ current, max }: ParticipantCountProps) {
  return (
    <div className="flex justify-between items-center px-6 py-4 rounded-md bg-zinc-700 w-[208px]">
      <Typo.Body size="medium" className="text-white">
        남은 참여 인원
      </Typo.Body>
      <div className="flex gap-1 items-end">
        <Typo.Body size="large" className="text-white">
          {current}명
        </Typo.Body>
        <Typo.Body size="medium" className="text-zinc-400">
          {`/${max}명`}
        </Typo.Body>
      </div>
    </div>
  );
}

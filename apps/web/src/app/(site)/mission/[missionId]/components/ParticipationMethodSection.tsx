"use client";

import { ParticipationStep, SectionHeader } from ".";

interface ParticipationMethod {
  title: string;
  description: string;
}

interface ParticipationMethodSectionProps {
  steps: ParticipationMethod[];
}

export function ParticipationMethodSection({ steps }: ParticipationMethodSectionProps) {
  return (
    <div className="flex flex-col gap-8 bg-white px-5 py-8 items-center">
      <SectionHeader badgeText="참여 방법" title="참여 방법 한 눈에 보기 👀" />

      <div className="flex flex-col gap-8 bg-zinc-50 rounded-md p-8 w-full">
        {steps.map((step, index) => (
          <ParticipationStep
            key={`${step.title}-${index}`}
            stepNumber={index + 1}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>
    </div>
  );
}

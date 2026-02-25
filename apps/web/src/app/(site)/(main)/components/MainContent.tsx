"use client";

import PollPollE from "@public/svgs/poll-poll-e.svg";
import { EmptyState } from "@repo/ui/components";
import { Loader2 } from "lucide-react";
import { useInfiniteContent } from "../hooks";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

interface MainContentProps {
  initialProjects: SurveyCardData[];
}

export function MainContent({ initialProjects }: MainContentProps) {
  const { mixedContent, isLoadingMore, observerRef } = useInfiniteContent({
    initialProjects,
  });

  return (
    <div className="flex flex-col gap-6">
      {mixedContent.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-5 md:grid-cols-3">
            {mixedContent.map(item => (
              <SurveyCard key={`project-${item.data.id}`} survey={item.data} />
            ))}
          </div>

          <div ref={observerRef} className="mt-8 flex h-10 justify-center">
            {isLoadingMore ? <Loader2 className="size-6 animate-spin text-violet-500" /> : null}
          </div>
        </>
      ) : (
        <div className="px-5">
          <EmptyState
            icon={<PollPollE className="size-30 text-zinc-200" />}
            title="아직 준비 중이에요"
            description="새로운 컨텐츠가 곧 찾아올 거예요!"
          />
        </div>
      )}
    </div>
  );
}

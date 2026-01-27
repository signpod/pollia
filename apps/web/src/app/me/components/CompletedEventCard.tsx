"use client";

import { formatToMonthDay } from "@/lib/date";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import { CheckCircle2Icon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { AnswerDetailModal } from "./AnswerDetailModal";

interface CompletedEventCardProps {
  response: MyMissionResponse;
}

export function CompletedEventCard({ response }: CompletedEventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mission, completedAt } = response;
  const [formattedCompletedAt, setFormattedCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    if (completedAt) {
      setFormattedCompletedAt(formatToMonthDay(completedAt));
    }
  }, [completedAt]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex w-full items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 text-left transition-colors hover:bg-zinc-50"
      >
        {mission.imageUrl ? (
          <div className="h-20 aspect-2/3 shrink-0 overflow-hidden rounded-xl">
            <img
              src={mission.imageUrl}
              alt={mission.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-20 aspect-2/3 shrink-0 flex items-center justify-center rounded-xl bg-zinc-100">
            <PollPollE className="size-8 text-zinc-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <CheckCircle2Icon className="size-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">
              {formattedCompletedAt ? `${formattedCompletedAt} 완료` : "완료"}
            </span>
          </div>
          <Typo.SubTitle className="mt-0.5 truncate">{mission.title}</Typo.SubTitle>
          <div className="mt-3 flex w-full items-center justify-end gap-1">
            <Typo.Body size="medium" className="text-zinc-400">
              답변 확인하기
            </Typo.Body>
            <ChevronRightIcon className="size-4 shrink-0 text-zinc-400" />
          </div>
        </div>
      </button>

      <AnswerDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        response={response}
      />
    </>
  );
}

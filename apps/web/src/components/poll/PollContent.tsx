"use client";

import { usePoll } from "@/hooks/poll/usePoll";
import { PollResultPage } from "./PollResultPage";
import { calculatePollResults } from "@/lib/poll-api";
import { useParams } from "next/navigation";

export function PollContent() {
  const params = useParams();
  const pollId = params.id as string;

  const { data: poll } = usePoll(pollId);
  const results = calculatePollResults(poll);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <PollResultPage poll={poll} results={results} />
      </div>
    </div>
  );
}

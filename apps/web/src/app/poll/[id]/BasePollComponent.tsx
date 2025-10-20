import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Typo, ProcessChip } from "@repo/ui/components";
import { useGetPoll, usePollResults } from "@/hooks/poll/usePoll";
import { getPollStatus, getPollStatusMessage } from "@/lib/utils";
import { User } from "lucide-react";

interface BasePollComponentProps extends React.PropsWithChildren {
  pollId: string;
}

export function BasePollComponent({
  pollId,
  children,
}: BasePollComponentProps) {
  const { data: poll } = useGetPoll(pollId);
  const { data: pollResults } = usePollResults(pollId);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const pollStatus = getPollStatus(
    poll?.data?.startDate ? new Date(poll.data.startDate) : null,
    poll?.data?.endDate ? new Date(poll.data.endDate) : null,
    poll?.data?.isIndefinite ?? false
  );

  useEffect(() => {
    setCurrentTime(new Date());

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statusMessage = currentTime
    ? getPollStatusMessage(
        poll?.data?.startDate ? new Date(poll.data.startDate) : null,
        poll?.data?.endDate ? new Date(poll.data.endDate) : null,
        poll?.data?.isIndefinite ?? false,
        currentTime
      )
    : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ProcessChip status={pollStatus} />
        <Typo.Body
          size="medium"
          className="text-violet-500 flex items-center gap-1"
        >
          <User size={16} />
          {pollResults?._count?.participants || 0}명 참여 중
        </Typo.Body>
      </div>

      <div className="space-y-1">
        <Typo.MainTitle size="medium">{poll?.data?.title}</Typo.MainTitle>
        {poll?.data?.description && (
          <Typo.Body size="large">{poll?.data?.description}</Typo.Body>
        )}
      </div>

      {poll?.data?.imageUrl && (
        <div className="w-full @container">
          <Image
            src={poll?.data?.imageUrl}
            alt={poll?.data?.title}
            width={400}
            height={400}
            className="w-full h-auto object-contain rounded-sm max-h-[161.8cqw]"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-zinc-500">
        <Typo.Body size="medium">
          {poll?.data?.maxSelections || 1}개 선택 가능
        </Typo.Body>

        <Typo.Body size="medium">{statusMessage}</Typo.Body>
      </div>

      {children}
    </div>
  );
}

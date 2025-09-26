import React from "react";
import Image from "next/image";
import { Typo } from "@repo/ui/components";
import { useGetPoll } from "@/hooks/poll/usePoll";
import { TimeDisplay } from "@/components/common/TimeDisplay";

interface BasePollComponentProps extends React.PropsWithChildren {
  pollId: string;
}

export function BasePollComponent({
  pollId,
  children,
}: BasePollComponentProps) {
  const { data: poll } = useGetPoll(pollId);

  return (
    <div className="space-y-4">
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

      <div className="flex items-center justify-between text-sm font-semibold w-full">
        <div className="text-violet-500">
          {poll?.data?._count?.votes || 0}명 참여 중
        </div>
        <div className="text-zinc-400 text-right">1개 선택 가능</div>
      </div>

      {children}

      <div className="flex items-center justify-end w-full">
        <TimeDisplay
          startDate={
            poll?.data?.startDate ? new Date(poll.data.startDate) : null
          }
          endDate={poll?.data?.endDate ? new Date(poll.data.endDate) : null}
          isIndefinite={poll?.data?.isIndefinite ?? false}
        />
      </div>
    </div>
  );
}

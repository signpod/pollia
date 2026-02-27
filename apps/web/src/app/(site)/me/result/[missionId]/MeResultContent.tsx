"use client";

import { ACTION_TYPE_CONFIG, AnswerContent } from "@/app/(site)/me/components/AnswerContent";
import { MissionCompletionTemplate } from "@/components/common/templates/MissionCompletionTemplate";
import { useReadMissionCompletion, useReadMissionCompletionById } from "@/hooks/mission-completion";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import type { MyMissionResponseAnswer } from "@/types/dto/mission-response";
import { ActionType } from "@prisma/client";
import { Tab, Typo } from "@repo/ui/components";
import { InfoIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface MeResultContentProps {
  missionId: string;
  completionId: string | null;
}

export function MeResultContent({ missionId, completionId }: MeResultContentProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "result";
  const [currentTab, setCurrentTab] = useState(initialTab);

  const byIdQuery = useReadMissionCompletionById(missionId, completionId);
  const defaultQuery = useReadMissionCompletion(missionId);
  const completion = (completionId ? byIdQuery : defaultQuery).data?.data;

  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value);
    window.history.replaceState(null, "", `?tab=${value}`);
  }, []);

  return (
    <Tab.Root value={currentTab} onValueChange={handleTabChange} pointColor="secondary">
      <Tab.List className="sticky top-12 z-10 bg-white">
        <Tab.Item value="result">
          <Typo.Body size="large">내 결과</Typo.Body>
        </Tab.Item>
        <Tab.Item value="answers">
          <Typo.Body size="large">내 답변</Typo.Body>
        </Tab.Item>
      </Tab.List>

      <Tab.Content value="result" className="m-0">
        <div className="min-h-[calc(100dvh-48px-45px)] bg-zinc-50">
          <MissionCompletionTemplate
            imageUrl={completion?.imageUrl}
            title={completion?.title}
            description={completion?.description ?? undefined}
          />
        </div>
      </Tab.Content>

      <Tab.Content value="answers" className="m-0">
        <MyAnswersTab missionId={missionId} />
      </Tab.Content>
    </Tab.Root>
  );
}

function MyAnswersTab({ missionId }: { missionId: string }) {
  const { data } = useReadMissionResponseForMission({ missionId });
  const answers = data?.data?.answers;

  const sortedAnswers = useMemo(() => {
    if (!answers) return [];
    return [...answers].sort((a, b) => (a.action.order ?? 0) - (b.action.order ?? 0));
  }, [answers]);

  if (!answers) return null;

  return (
    <div className="flex flex-col gap-8 px-5 pb-10 pt-5">
      <div className="flex items-center justify-between">
        <Typo.SubTitle size="large">총 {sortedAnswers.length}개의 답변</Typo.SubTitle>
        <div className="flex items-center gap-1 text-zinc-400">
          <InfoIcon className="size-4" />
          <Typo.Body size="medium" className="font-semibold text-zinc-400">
            제출한 답변은 수정할 수 없어요
          </Typo.Body>
        </div>
      </div>

      {sortedAnswers.length > 0 ? (
        <div className="flex flex-col gap-6">
          {sortedAnswers.map((answer, index) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              index={index}
              isLast={index === sortedAnswers.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <Typo.Body size="large" className="text-zinc-400">
            응답 내용이 없어요
          </Typo.Body>
        </div>
      )}
    </div>
  );
}

function AnswerItem({
  answer,
  index,
  isLast,
}: {
  answer: MyMissionResponseAnswer;
  index: number;
  isLast: boolean;
}) {
  const actionType = answer.action.type as ActionType;
  const config = ACTION_TYPE_CONFIG[actionType] ?? { icon: null, label: actionType };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Typo.SubTitle size="large">Q.{index + 1}</Typo.SubTitle>
            <span className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-bold text-zinc-500">
              {config.label}
            </span>
          </div>
          <Typo.SubTitle size="large">{answer.action.title}</Typo.SubTitle>
        </div>
        <AnswerContent answer={answer} />
      </div>
      {!isLast && <div className="h-px w-full bg-zinc-100" />}
    </>
  );
}

"use client";

import { getQuizResult } from "@/actions/quiz/read";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import type { GradedItem } from "@/server/services/quiz-grading/types";
import type { ActionDetail } from "@/types/dto";
import type { GetMissionResponseResponse } from "@/types/dto/mission-response";
import { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2Icon, ChevronDown, XCircleIcon } from "lucide-react";
import { useCallback, useState } from "react";

interface QuizScoreSummaryProps {
  missionId: string;
  showCorrectOnWrong?: boolean;
}

export function QuizScoreSummary({ missionId, showCorrectOnWrong = true }: QuizScoreSummaryProps) {
  const { data: responseData } = useReadMissionResponseForMission({ missionId });
  const responseId = responseData?.data?.id;

  const { data: quizResult } = useQuery({
    queryKey: ["quiz-result", missionId, responseId],
    queryFn: () => getQuizResult(responseId!, missionId),
    enabled: !!responseId,
    staleTime: 5 * 60 * 1000,
  });

  if (!quizResult) return null;

  const { gradeResult, percentile } = quizResult;
  const correctCount = gradeResult.gradedItems.filter(i => i.isCorrect).length;
  const totalCount = gradeResult.gradedItems.length;

  return (
    <div className="flex w-full flex-col gap-10">
      <ScoreSection
        correctCount={correctCount}
        totalCount={totalCount}
        totalScore={gradeResult.totalScore}
        perfectScore={gradeResult.perfectScore}
        percentile={percentile}
      />
      <QuestionReviewSection
        missionId={missionId}
        gradedItems={gradeResult.gradedItems}
        responseData={responseData?.data ? (responseData as GetMissionResponseResponse) : undefined}
        showCorrectOnWrong={showCorrectOnWrong}
      />
    </div>
  );
}

function ScoreSection({
  correctCount,
  totalCount,
  totalScore,
  perfectScore,
  percentile,
}: {
  correctCount: number;
  totalCount: number;
  totalScore: number;
  perfectScore: number;
  percentile: number | null;
}) {
  return (
    <section className="flex flex-col gap-4 px-5">
      <Typo.MainTitle size="small">점수 요약</Typo.MainTitle>
      <div className="flex flex-col items-center gap-5 rounded-2xl ring-1 ring-default bg-white px-5 py-8">
        <div className="flex items-baseline gap-1">
          <Typo.MainTitle size="large" className="text-5xl text-point">
            {totalScore}
          </Typo.MainTitle>
          <Typo.SubTitle size="large" className="text-info">
            점
          </Typo.SubTitle>
          <Typo.Body size="small" className="text-info">
            / {perfectScore}점
          </Typo.Body>
        </div>

        <div className="h-px w-full bg-divider-default" />

        <div className="flex w-full justify-around">
          <div className="flex flex-col items-center gap-1">
            <Typo.Body size="small" className="text-info">
              전체 문항
            </Typo.Body>
            <Typo.SubTitle size="large">{totalCount}문제</Typo.SubTitle>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Typo.Body size="small" className="text-info">
              맞은 문항
            </Typo.Body>
            <Typo.SubTitle size="large" className="text-point">
              {correctCount}문제
            </Typo.SubTitle>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Typo.Body size="small" className="text-info">
              틀린 문항
            </Typo.Body>
            <Typo.SubTitle size="large">{totalCount - correctCount}문제</Typo.SubTitle>
          </div>
        </div>

        {percentile !== null && (
          <>
            <div className="h-px w-full bg-divider-default" />
            <div className="flex items-center gap-1.5">
              <Typo.Body size="medium" className="text-sub">
                전체 참여자 중
              </Typo.Body>
              <Typo.SubTitle size="large" className="text-point">
                상위 {percentile}%
              </Typo.SubTitle>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function QuestionReviewSection({
  missionId,
  gradedItems,
  responseData,
  showCorrectOnWrong,
}: {
  missionId: string;
  gradedItems: GradedItem[];
  responseData?: GetMissionResponseResponse;
  showCorrectOnWrong: boolean;
}) {
  const { data: actionsData } = useReadActionsDetail(missionId);
  const actions = actionsData?.data ?? [];
  const answers = responseData?.data?.answers ?? [];

  if (gradedItems.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 px-5">
      <Typo.MainTitle size="small">문항별 결과</Typo.MainTitle>
      <div className="flex flex-col gap-3">
        {gradedItems.map((item, index) => {
          const action = actions.find(a => a.id === item.actionId);
          const answer = answers.find(a => a.actionId === item.actionId);
          return (
            <QuestionReviewItem
              key={item.actionId}
              item={item}
              index={index}
              action={action}
              userAnswer={answer}
              showCorrectOnWrong={showCorrectOnWrong}
            />
          );
        })}
      </div>
    </section>
  );
}

function QuestionReviewItem({
  item,
  index,
  action,
  userAnswer,
  showCorrectOnWrong,
}: {
  item: GradedItem;
  index: number;
  action?: ActionDetail;
  userAnswer?: GetMissionResponseResponse["data"]["answers"][number];
  showCorrectOnWrong: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const canExpand = !item.isCorrect && !!action && showCorrectOnWrong;

  const handleToggle = useCallback(() => {
    if (canExpand) setIsOpen(prev => !prev);
  }, [canExpand]);

  const userAnswerText = getUserAnswerText(userAnswer, action);
  const correctAnswerText = getCorrectAnswerText(action);

  return (
    <div className="rounded-xl ring-1 ring-default overflow-hidden">
      <div
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
        className={cn("flex w-full items-center gap-3 px-4 py-3", canExpand && "cursor-pointer")}
        onClick={canExpand ? handleToggle : undefined}
      >
        {item.isCorrect ? (
          <CheckCircle2Icon className="size-5 shrink-0 text-blue-500" />
        ) : (
          <XCircleIcon className="size-5 shrink-0 text-rose-500" />
        )}

        <div className="flex-1 min-w-0 text-left">
          <Typo.Body size="medium" className="truncate">
            Q{index + 1}. {action?.title ?? `문항 ${index + 1}`}
          </Typo.Body>
        </div>

        <Typo.Body
          size="small"
          className={item.isCorrect ? "text-blue-600 font-bold" : "text-rose-500 font-bold"}
        >
          {item.isCorrect ? `+${item.maxScore}점` : "0점"}
        </Typo.Body>

        {canExpand && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-zinc-400 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3">
              {userAnswerText && (
                <div className="flex items-start gap-2">
                  <Typo.Body size="small" className="shrink-0 text-zinc-400 font-semibold">
                    내 답
                  </Typo.Body>
                  <Typo.Body size="small" className="text-zinc-400 line-through">
                    {userAnswerText}
                  </Typo.Body>
                </div>
              )}
              {showCorrectOnWrong && correctAnswerText && (
                <div className="flex items-start gap-2">
                  <Typo.Body size="small" className="shrink-0 text-violet-600 font-semibold">
                    정답
                  </Typo.Body>
                  <Typo.Body size="small" className="text-violet-600">
                    {correctAnswerText}
                  </Typo.Body>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getUserAnswerText(
  userAnswer?: GetMissionResponseResponse["data"]["answers"][number],
  action?: ActionDetail,
): string | null {
  if (!userAnswer) return null;

  const type = action?.type;

  if (type === ActionType.OX || type === ActionType.MULTIPLE_CHOICE) {
    return userAnswer.options.map(opt => opt.title).join(", ") || null;
  }

  if (type === ActionType.SHORT_TEXT || type === ActionType.SUBJECTIVE) {
    return userAnswer.textAnswer || null;
  }

  return null;
}

function getCorrectAnswerText(action?: ActionDetail): string | null {
  if (!action) return null;

  const correctOptions = action.options.filter(opt => opt.isCorrect);
  if (correctOptions.length === 0) return null;

  return correctOptions.map(opt => opt.title).join(", ");
}

import { useQuizContext } from "@/app/(site)/mission/[missionId]/action/[actionId]/quiz/QuizProvider";
import { ActionOptionButton } from "@/app/(site)/mission/[missionId]/components";
import { ActionStepContentProps, CLIENT_OTHER_OPTION_ID } from "@/constants/action";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useActionContext } from "../common/ActionContext";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { MultipleChoiceProvider, useSurveyMultipleChoice } from "../common/MultipleChoiceProvider";
import { shuffleArray } from "../common/shuffleArray";

export function MultipleChoice({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  return (
    <MultipleChoiceProvider
      maxSelections={actionData.maxSelections ?? 1}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
      options={actionData.options ?? []}
      actionNextActionId={actionData.nextActionId}
      actionNextCompletionId={actionData.nextCompletionId}
    >
      <SurveyMultipleChoiceContent actionData={actionData} />
    </MultipleChoiceProvider>
  );
}

function SurveyMultipleChoiceContent({ actionData }: ActionStepContentProps) {
  const isMultipleChoice = !!actionData.maxSelections && actionData.maxSelections > 1;
  const { selectedIds, toggleSelectedId, textAnswer, setTextAnswer, isOtherSelected } =
    useSurveyMultipleChoice();
  const { shuffleChoices } = useActionContext();
  const quizContext = useQuizContext();
  const isQuiz = !!quizContext;

  const [showOtherError, setShowOtherError] = useState(false);

  useEffect(() => {
    if (isOtherSelected) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [isOtherSelected]);

  const regularOptions = useMemo(() => {
    const opts = actionData.options || [];
    return shuffleChoices ? shuffleArray(opts) : opts;
  }, [actionData.options, shuffleChoices]);
  const otherOption = actionData.hasOther
    ? {
        id: CLIENT_OTHER_OPTION_ID,
        title: "기타(직접입력)",
        description: null,
        imageUrl: null,
        order: 999,
      }
    : null;

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextAnswer(e.target.value);
    if (e.target.value.trim()) {
      setShowOtherError(false);
    }
  };

  const handleTextAnswerBlur = () => {
    if (isOtherSelected && !textAnswer.trim()) {
      setShowOtherError(true);
    }
  };

  const hasImage = actionData.options?.some(option => !!option.imageUrl);

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
      hint={actionData.hint ?? undefined}
    >
      <div className="flex flex-col gap-2 w-full">
        {isMultipleChoice && actionData.maxSelections && (
          <Typo.Body size="small" className="text-sub">
            {isQuiz
              ? `정답을 ${actionData.maxSelections}개 선택해주세요`
              : `최대 ${actionData.maxSelections}개 선택 가능`}
            {` (${selectedIds.size}/${actionData.maxSelections})`}
          </Typo.Body>
        )}
        <div className={cn("gap-2 w-full", hasImage ? "grid grid-cols-2" : "flex flex-col")}>
          {regularOptions.map(option => {
            const isSelected = selectedIds.has(option.id);

            return (
              <ActionOptionButton
                key={option.id}
                selectType={isMultipleChoice ? "checkbox" : "radio"}
                imageUrl={option.imageUrl ?? undefined}
                title={option.title}
                description={option.description ?? undefined}
                isSelected={isSelected}
                disabled={
                  isMultipleChoice &&
                  !isSelected &&
                  actionData.maxSelections !== null &&
                  selectedIds.size >= actionData.maxSelections
                }
                onClick={() => toggleSelectedId(option.id)}
              />
            );
          })}
        </div>

        {otherOption && (
          <div className="w-full">
            <motion.div
              initial={false}
              animate={{
                width: isOtherSelected || !hasImage ? "100%" : "calc(50% - 4px)",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ActionOptionButton
                selectType={isMultipleChoice ? "checkbox" : "radio"}
                title={otherOption.title}
                isSelected={isOtherSelected}
                disabled={
                  isMultipleChoice &&
                  !isOtherSelected &&
                  actionData.maxSelections !== null &&
                  selectedIds.size >= actionData.maxSelections
                }
                onClick={() => toggleSelectedId(otherOption.id)}
                isOther
                textAnswer={textAnswer}
                onTextAnswerChange={handleTextAnswerChange}
                onTextAnswerBlur={handleTextAnswerBlur}
                showOtherError={showOtherError}
              />
            </motion.div>
          </div>
        )}
      </div>
    </SurveyQuestionTemplate>
  );
}

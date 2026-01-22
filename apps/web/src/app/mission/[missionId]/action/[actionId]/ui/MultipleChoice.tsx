import { ActionOptionButton } from "@/app/mission/[missionId]/components";
import { ActionStepContentProps, CLIENT_OTHER_OPTION_ID } from "@/constants/action";
import { cn } from "@repo/ui/lib";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { MultipleChoiceProvider, useSurveyMultipleChoice } from "./MultipleChoiceProvider";

export function MultipleChoice({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled,
  updateCanGoNext,
  onAnswerChange,
  missionResponse,
  isLoading,
}: ActionStepContentProps) {
  return (
    <MultipleChoiceProvider
      maxSelections={actionData.maxSelections ?? 1}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
    >
      <SurveyMultipleChoiceContent
        actionData={actionData}
        currentOrder={currentOrder}
        totalActionCount={totalActionCount}
        isFirstAction={isFirstAction}
        isNextDisabled={isNextDisabled}
        onPrevious={onPrevious}
        onNext={onNext}
        nextButtonText={nextButtonText}
        isLoading={isLoading}
      />
    </MultipleChoiceProvider>
  );
}

function SurveyMultipleChoiceContent({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled: isNextDisabledProp,
  isLoading,
}: Omit<ActionStepContentProps, "updateCanGoNext" | "onAnswerChange">) {
  const isMultipleChoice = !!actionData.maxSelections && actionData.maxSelections > 1;
  const { selectedIds, toggleSelectedId, canGoNext, textAnswer, setTextAnswer, isOtherSelected } =
    useSurveyMultipleChoice();

  const [showOtherError, setShowOtherError] = useState(false);

  useEffect(() => {
    if (isOtherSelected) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [isOtherSelected]);

  const regularOptions = actionData.options || [];
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
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp || !canGoNext}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
      isRequired={actionData.isRequired}
    >
      <div className="flex flex-col gap-2 w-full">
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

import { ActionOptionButton } from "@/app/mission/[missionId]/components";
import { ActionStepContentProps, CLIENT_OTHER_OPTION_ID } from "@/constants/action";
import { useState } from "react";
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

  // Add "기타" option to the end of options list (client-side only)
  const optionsWithOther = [
    ...(actionData.options || []),
    { id: CLIENT_OTHER_OPTION_ID, title: "기타", description: null, imageUrl: null, order: 999 },
  ];

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
    >
      <div className="flex flex-col gap-2 w-full">
        {optionsWithOther.map(option => {
          const isOther = option.id === CLIENT_OTHER_OPTION_ID;
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
              isOther={isOther}
              textAnswer={textAnswer}
              onTextAnswerChange={handleTextAnswerChange}
              onTextAnswerBlur={handleTextAnswerBlur}
              showOtherError={showOtherError}
            />
          );
        })}
      </div>
    </SurveyQuestionTemplate>
  );
}

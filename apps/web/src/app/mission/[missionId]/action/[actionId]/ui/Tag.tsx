import { toast } from "@/components/common/Toast";
import { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { Chip } from "./Chip";
import { MultipleChoiceProvider, useSurveyMultipleChoice } from "./MultipleChoiceProvider";

export function ActionTag({
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
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
      answerType={ActionType.TAG}
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
  const { selectedIds, toggleSelectedId, canGoNext } = useSurveyMultipleChoice();

  const isDisabled =
    actionData.maxSelections !== null && selectedIds.size >= actionData.maxSelections;

  const handleClick = (optionId: string) => {
    if (isDisabled && !selectedIds.has(optionId) && actionData.maxSelections !== null) {
      toast.default(`최대 ${actionData.maxSelections}개까지 선택할 수 있어요.`);
      return;
    }
    toggleSelectedId(optionId);
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
      <div className="flex flex-wrap gap-3 w-full">
        {actionData.options?.map(option => (
          <Chip
            key={option.id}
            label={option.title}
            isSelected={selectedIds.has(option.id)}
            onClick={() => handleClick(option.id)}
          />
        ))}
      </div>
    </SurveyQuestionTemplate>
  );
}

import { ActionOptionButton } from "@/app/mission/[missionId]/components";
import { ActionStepContentProps } from "@/constants/action";
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
  const { selectedIds, toggleSelectedId, canGoNext } = useSurveyMultipleChoice();

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
        {actionData.options?.map(option => (
          <ActionOptionButton
            key={option.id}
            selectType={isMultipleChoice ? "checkbox" : "radio"}
            imageUrl={option.imageUrl ?? undefined}
            title={option.title}
            description={option.description ?? undefined}
            isSelected={selectedIds.has(option.id)}
            disabled={
              isMultipleChoice &&
              !selectedIds.has(option.id) &&
              actionData.maxSelections !== null &&
              selectedIds.size >= actionData.maxSelections
            }
            onClick={() => toggleSelectedId(option.id)}
          />
        ))}
      </div>
    </SurveyQuestionTemplate>
  );
}

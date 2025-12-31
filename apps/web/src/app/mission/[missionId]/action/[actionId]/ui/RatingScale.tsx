import { ActionStepContentProps } from "@/constants/action";
import { useMissionScaleValue } from "@/hooks/action";
import { RatingScale } from "@repo/ui/components";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { getScaleClassName } from "../utils";

export function MissionRatingScale({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled: isNextDisabledProp,
  updateCanGoNext,
  onAnswerChange,
  missionResponse,
  isLoading,
}: ActionStepContentProps) {
  const { scaleValue, handleScaleValueChange } = useMissionScaleValue({
    actionId: actionData.id,
    isRequired: actionData.isRequired,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
    defaultValue: actionData.options.length > 0 ? Math.floor(actionData.options.length / 2) : 0,
  });

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
    >
      <RatingScale
        options={actionData.options.map(option => ({
          id: option.id,
          title: option.title ?? undefined,
          description: option.description ?? undefined,
          order: option.order,
        }))}
        value={scaleValue}
        onChange={handleScaleValueChange}
        className={getScaleClassName(!!actionData.imageUrl)}
      />
    </SurveyQuestionTemplate>
  );
}

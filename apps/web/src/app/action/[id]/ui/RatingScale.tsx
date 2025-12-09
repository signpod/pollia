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
}: ActionStepContentProps) {
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useMissionScaleValue({
    actionId: actionData.id,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
    defaultValue: 3,
  });

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp || !isScaleValueChanged}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
    >
      <RatingScale
        options={actionData.options.map(option => ({
          id: option.id,
          title: option.title,
          order: option.order,
        }))}
        value={scaleValue}
        onChange={handleScaleValueChange}
        className={getScaleClassName(!!actionData.imageUrl)}
      />
    </SurveyQuestionTemplate>
  );
}

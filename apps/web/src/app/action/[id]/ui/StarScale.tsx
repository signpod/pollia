import { ActionStepContentProps } from "@/constants/action";
import { useMissionRatingValue } from "@/hooks/action";
import { StarScale } from "@repo/ui/components";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { getScaleClassName, scaleValueToStarRating, starRatingToScaleValue } from "../utils";

export function MissionStarScale({
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
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useMissionRatingValue({
    actionId: actionData.id,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
    defaultValue: 0,
  });

  const starRating = scaleValueToStarRating(scaleValue);

  const handleStarRatingChange = (newStarRating: number) => {
    const newScaleValue = starRatingToScaleValue(newStarRating);
    handleScaleValueChange(newScaleValue);
  };

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
      isLoading={isLoading}
    >
      <StarScale
        value={starRating}
        onChange={handleStarRatingChange}
        className={getScaleClassName(!!actionData.imageUrl)}
      />
    </SurveyQuestionTemplate>
  );
}

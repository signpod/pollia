import { ActionStepContentProps } from "@/constants/action";
import { useMissionRatingValue } from "@/hooks/action";
import { StarScale } from "@repo/ui/components";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";
import { getScaleClassName, scaleValueToStarRating, starRatingToScaleValue } from "../utils";

export function MissionStarScale({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse, isNextDisabled } = useActionContext();

  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useMissionRatingValue({
    actionId: actionData.id,
    isRequired: actionData.isRequired,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
    defaultValue: 0,
    nextActionId: actionData.nextActionId,
    nextCompletionId: actionData.nextCompletionId,
  });

  const starRating = scaleValueToStarRating(scaleValue);

  const handleStarRatingChange = (newStarRating: number) => {
    const newScaleValue = starRatingToScaleValue(newStarRating);
    handleScaleValueChange(newScaleValue);
  };

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <StarScale
        value={starRating}
        onChange={handleStarRatingChange}
        className={getScaleClassName(!!actionData.imageUrl)}
      />
    </SurveyQuestionTemplate>
  );
}

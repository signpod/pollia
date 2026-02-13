import { ActionStepContentProps } from "@/constants/action";
import { useMissionRatingValue } from "@/hooks/action";
import { StarScale } from "@repo/ui/components";
import { useActionContext } from "../common/ActionContext";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { getScaleClassName, scaleValueToStarRating, starRatingToScaleValue } from "../common/utils";

export function MissionStarScale({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const { scaleValue, handleScaleValueChange } = useMissionRatingValue({
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

import { ActionStepContentProps } from "@/constants/action";
import { useMissionScaleValue } from "@/hooks/action";
import { RatingScale } from "@repo/ui/components";
import { useActionContext } from "../common/ActionContext";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { getScaleClassName } from "../common/utils";

export function MissionRatingScale({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const { scaleValue, handleScaleValueChange } = useMissionScaleValue({
    actionId: actionData.id,
    isRequired: actionData.isRequired,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
    defaultValue: actionData.options.length > 0 ? Math.floor(actionData.options.length / 2) : 0,
    nextActionId: actionData.nextActionId,
    nextCompletionId: actionData.nextCompletionId,
  });

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
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

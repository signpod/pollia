import { ActionOptionButton } from "@/app/(site)/mission/[missionId]/components";
import type { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import { useMemo } from "react";
import { useActionContext } from "../common/ActionContext";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { MultipleChoiceProvider, useSurveyMultipleChoice } from "../common/MultipleChoiceProvider";
import { shuffleArray } from "../common/shuffleArray";

export function OXChoice({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  return (
    <MultipleChoiceProvider
      maxSelections={1}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
      answerType={ActionType.OX}
      options={actionData.options ?? []}
      actionNextActionId={actionData.nextActionId}
      actionNextCompletionId={actionData.nextCompletionId}
    >
      <OXChoiceContent actionData={actionData} />
    </MultipleChoiceProvider>
  );
}

// TODO: OX 이미지를 서버에서 내려주도록 변경
const OX_IMAGES: Record<number, string> = {
  0: "https://lpgfbjohdashthkhxzab.supabase.co/storage/v1/object/public/action-option-images/73020cf542380210cfec92ee153f162c.jpg",
  1: "https://lpgfbjohdashthkhxzab.supabase.co/storage/v1/object/public/action-option-images/678d854252129f5ecde403868bb88370.jpg",
};

function OXChoiceContent({ actionData }: ActionStepContentProps) {
  const { selectedIds, toggleSelectedId } = useSurveyMultipleChoice();
  const { shuffleChoices } = useActionContext();
  const options = actionData.options ?? [];

  const originalIndexMap = useMemo(() => new Map(options.map((opt, i) => [opt.id, i])), [options]);

  const displayOptions = useMemo(
    () => (shuffleChoices ? shuffleArray(options) : options),
    [options, shuffleChoices],
  );

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
      hint={actionData.hint ?? undefined}
    >
      <div className="grid grid-cols-2 gap-3">
        {displayOptions.map(option => (
          <ActionOptionButton
            key={option.id}
            selectType="radio"
            title={option.title}
            imageUrl={option.fileUploadId ?? OX_IMAGES[originalIndexMap.get(option.id) ?? 0]}
            isSelected={selectedIds.has(option.id)}
            onClick={() => toggleSelectedId(option.id)}
          />
        ))}
      </div>
    </SurveyQuestionTemplate>
  );
}

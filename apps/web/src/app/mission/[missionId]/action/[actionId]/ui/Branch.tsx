import { ActionOptionButton } from "@/app/mission/[missionId]/components";
import { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";

export function Branch({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const options = actionData.options ?? [];
  const onAnswerChangeRef = useRef(onAnswerChange);
  onAnswerChangeRef.current = onAnswerChange;

  const existingAnswer = useMemo(() => {
    const answers = missionResponse?.data?.answers ?? [];
    return answers.find(a => a.actionId === actionData.id);
  }, [missionResponse?.data?.answers, actionData.id]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const firstOption = existingAnswer?.options?.[0];
    if (firstOption) {
      setSelectedId(firstOption.id);

      const selectedOption = options.find(opt => opt.id === firstOption.id);
      onAnswerChangeRef.current?.({
        actionId: actionData.id,
        type: ActionType.BRANCH,
        isRequired: actionData.isRequired,
        selectedOptionIds: [firstOption.id],
        nextActionId: selectedOption?.nextActionId ?? actionData.nextActionId ?? undefined,
        nextCompletionId: selectedOption?.nextCompletionId ?? actionData.nextCompletionId ?? undefined,
      });
    }
  }, [existingAnswer, actionData.id, actionData.isRequired, actionData.nextActionId, actionData.nextCompletionId, options]);

  const canGoNext = useMemo(() => {
    if (!actionData.isRequired) return true;
    return selectedId !== null;
  }, [actionData.isRequired, selectedId]);

  useEffect(() => {
    updateCanGoNext?.(canGoNext);
  }, [canGoNext, updateCanGoNext]);

  const handleSelect = useCallback(
    (optionId: string) => {
      setSelectedId(optionId);

      const selectedOption = options.find(opt => opt.id === optionId);

      onAnswerChange?.({
        actionId: actionData.id,
        type: ActionType.BRANCH,
        isRequired: actionData.isRequired,
        selectedOptionIds: [optionId],
        nextActionId: selectedOption?.nextActionId ?? actionData.nextActionId ?? undefined,
        nextCompletionId: selectedOption?.nextCompletionId ?? actionData.nextCompletionId ?? undefined,
      });
    },
    [actionData, options, onAnswerChange],
  );

  const hasImage = options.some(option => !!option.imageUrl);

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <div className={hasImage ? "grid grid-cols-2 gap-2 w-full" : "flex flex-col gap-2 w-full"}>
        {options.map(option => {
          const isSelected = isHydrated && selectedId === option.id;

          return (
            <ActionOptionButton
              key={option.id}
              selectType="radio"
              imageUrl={option.imageUrl ?? undefined}
              title={option.title}
              description={option.description ?? undefined}
              isSelected={isSelected}
              onClick={() => handleSelect(option.id)}
            />
          );
        })}
      </div>
    </SurveyQuestionTemplate>
  );
}

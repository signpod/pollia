import { multipleChoiceMaxSelectionsAtom } from "@/atoms/survey/quetion/multipleChoiceInfoAtoms";
import { SurveyQuestionOption } from "@/components/survey/SurveyQuestionOption";
import { useMultipleChoiceOptions } from "@/hooks/survey/question";
import { Button, CounterInput, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect } from "react";

export function OptionSelectorSection() {
  const {
    options,
    updateOption,
    addOption,
    removeOption,
    canAddMore,
    canRemove,
    maxOptions,
    validOptionCount,
  } = useMultipleChoiceOptions();

  const [maxSelections, setMaxSelections] = useAtom(multipleChoiceMaxSelectionsAtom);

  useEffect(() => {
    if (validOptionCount > 0 && maxSelections > validOptionCount) {
      setMaxSelections(validOptionCount);
    }

    if (validOptionCount === 0 && maxSelections > 1) {
      setMaxSelections(1);
    }
  }, [validOptionCount, maxSelections, setMaxSelections]);

  const hasEmptyOptions = options.some(option => !option.title.trim());

  const createFieldHandler = useCallback(
    (id: string) => ({
      onTitleChange: (title: string) => updateOption(id, { title }),
      onDescriptionChange: (description: string) => updateOption(id, { description }),
      onImageUrlChange: (imageUrl: string) => updateOption(id, { imageUrl }),
      onFileUploadIdChange: (fileUploadId: string) => updateOption(id, { fileUploadId }),
      onRemove: () => canRemove && removeOption(id),
    }),
    [updateOption, removeOption, canRemove],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">답변 항목</Typo.SubTitle>
          <span className="text-red-500">*</span>
        </div>
        <Typo.Body size="small" className="text-zinc-400">
          {options.length}/{maxOptions}
        </Typo.Body>
      </div>

      {options.map(option => {
        const {
          onTitleChange,
          onDescriptionChange,
          onImageUrlChange,
          onFileUploadIdChange,
          onRemove,
        } = createFieldHandler(option.id);

        return (
          <SurveyQuestionOption
            key={option.id}
            id={option.id}
            title={option.title}
            description={option.description || ""}
            imageUrl={option.imageUrl || ""}
            fileUploadId={option.fileUploadId || ""}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            onImageUrlChange={onImageUrlChange}
            onFileUploadIdChange={onFileUploadIdChange}
            onRemove={onRemove}
          />
        );
      })}

      <Button
        variant="secondary"
        leftIcon={<PlusIcon />}
        onClick={addOption}
        disabled={!canAddMore || hasEmptyOptions}
      >
        <Typo.ButtonText size="large">
          {hasEmptyOptions
            ? "모든 항목을 입력해주세요"
            : canAddMore
              ? "항목 추가하기"
              : `최대 ${maxOptions}개까지 추가 가능`}
        </Typo.ButtonText>
      </Button>

      <div className="flex justify-between">
        <Typo.SubTitle size="large">선택 가능 답변 수</Typo.SubTitle>
        <CounterInput
          value={maxSelections}
          onChange={setMaxSelections}
          min={1}
          max={Math.max(1, validOptionCount)}
        />
      </div>
    </div>
  );
}

import PollOption from "@/components/poll/PollOption";
import { useMultipleOptions } from "@/hooks/poll/useMultipleOptions";
import { multiplePollMaxSelectionsAtom } from "@/atoms/create/multiplePollAtoms";
import { Button, CounterInput, Typo } from "@repo/ui/components";
import { PlusIcon } from "lucide-react";
import { useAtom } from "jotai";
import { useEffect } from "react";

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
  } = useMultipleOptions();

  const [maxSelections, setMaxSelections] = useAtom(
    multiplePollMaxSelectionsAtom
  );

  useEffect(() => {
    if (validOptionCount > 0 && maxSelections > validOptionCount) {
      setMaxSelections(validOptionCount);
    }

    if (validOptionCount === 0 && maxSelections > 1) {
      setMaxSelections(1);
    }
  }, [validOptionCount, maxSelections, setMaxSelections]);

  const hasEmptyOptions = options.some((option) => !option.description.trim());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">투표 항목</Typo.SubTitle>
          <span className="text-red-500">*</span>
        </div>
        <Typo.Body size="small" className="text-zinc-400">
          {options.length}/{maxOptions}
        </Typo.Body>
      </div>

      {options.map((option) => {
        const handleDescriptionChange = (description: string) => {
          updateOption(option.id, { description });
        };

        const handleImageUrlChange = (imageUrl: string) => {
          updateOption(option.id, { imageUrl });
        };

        const handleLinkChange = (link: string) => {
          updateOption(option.id, { link });
        };

        const handleFileUploadIdChange = (fileUploadId: string) => {
          updateOption(option.id, { fileUploadId });
        };

        const handleRemove = () => {
          if (canRemove) {
            removeOption(option.id);
          }
        };

        return (
          <PollOption
            key={option.id}
            id={option.id}
            description={option.description || ""}
            imageUrl={option.imageUrl || ""}
            link={option.link || ""}
            fileUploadId={option.fileUploadId || ""}
            onDescriptionChange={handleDescriptionChange}
            onImageUrlChange={handleImageUrlChange}
            onLinkChange={handleLinkChange}
            onFileUploadIdChange={handleFileUploadIdChange}
            onRemove={canRemove ? handleRemove : () => {}}
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

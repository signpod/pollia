import PollOption from "@/components/poll/PollOption";
import { useMultipleOptions } from "@/hooks/poll/useMultipleOptions";
import { Button, Typo } from "@repo/ui/components";
import { PlusIcon } from "lucide-react";

export default function OptionSelector() {
  const {
    options,
    updateOption,
    addOption,
    removeOption,
    canAddMore,
    canRemove,
    maxOptions,
  } = useMultipleOptions();

  return (
    <>
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
            description={option.description || ""}
            imageUrl={option.imageUrl || ""}
            link={option.link || ""}
            fileUploadId={option.fileUploadId || ""}
            onDescriptionChange={handleDescriptionChange}
            onImageUrlChange={handleImageUrlChange}
            onLinkChange={handleLinkChange}
            onFileUploadIdChange={handleFileUploadIdChange}
            onRemove={canRemove ? handleRemove : () => {}}
            {...option}
          />
        );
      })}

      <Button
        variant="secondary"
        leftIcon={<PlusIcon />}
        onClick={addOption}
        disabled={!canAddMore}
      >
        <Typo.ButtonText size="large">
          {canAddMore ? "항목 추가하기" : `최대 ${maxOptions}개까지 추가 가능`}
        </Typo.ButtonText>
      </Button>
    </>
  );
}

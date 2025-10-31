import { useAtomValue } from "jotai";
import { Button, FixedBottomLayout, toast, Typo } from "@repo/ui/components";
import {
  binaryPollCategoryAtom,
  binaryPollDescriptionAtom,
  binaryPollEndDateAtom,
  binaryPollEndTimeAtom,
  binaryPollIsUnlimitedAtom,
  binaryPollStartDateAtom,
  binaryPollStartTimeAtom,
  binaryPollThumbnailFileUploadIdAtom,
  binaryPollThumbnailUrlAtom,
  binaryPollTitleAtom,
} from "@/atoms/create/binaryPollAtoms";
import { useBinaryPollSubmit } from "@/hooks/poll/useBinaryPollSubmit";
import { binaryPollSchema } from "@/schemas/binaryPollSchema";
import { CategoryButton } from "./components/CategoryButton";
import { DescriptionInput } from "./components/DescriptionInput";
import { SubjectInput } from "./components/SubjectInput";
import { ThumbnailSelector } from "./components/ThumbnailSelector";
import { VotingPeriodSection } from "./components/VotingPeriodSection";

const CREATE_BINARY_POLL_MESSAGES = {
  error: "폴 만들기 실패했어요.",
} as const;

export function BinaryInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <CategoryButton categoryAtom={binaryPollCategoryAtom} />
        <ThumbnailSelector
          thumbnailUrlAtom={binaryPollThumbnailUrlAtom}
          thumbnailFileUploadIdAtom={binaryPollThumbnailFileUploadIdAtom}
        />
        <SubjectInput titleAtom={binaryPollTitleAtom} schema={binaryPollSchema} />
        <DescriptionInput descriptionAtom={binaryPollDescriptionAtom} />
      </div>

      {/* DIVIDER */}
      <div className="h-2 w-full bg-zinc-50" />

      <div className="flex flex-col gap-6 px-5">
        <VotingPeriodSection
          isUnlimitedAtom={binaryPollIsUnlimitedAtom}
          startDateAtom={binaryPollStartDateAtom}
          startTimeAtom={binaryPollStartTimeAtom}
          endDateAtom={binaryPollEndDateAtom}
          endTimeAtom={binaryPollEndTimeAtom}
        />
      </div>

      <BinaryInfoCTAButton />
    </div>
  );
}

function BinaryInfoCTAButton() {
  const uploadedFileId = useAtomValue(binaryPollThumbnailFileUploadIdAtom);

  const { handleSubmit, isLoading, isValid, isImageUploading } = useBinaryPollSubmit({
    onError: () => {
      toast.error(CREATE_BINARY_POLL_MESSAGES.error);
    },
  });

  const handleCreatePoll = () => {
    handleSubmit(uploadedFileId);
  };

  return (
    <FixedBottomLayout.Content>
      <div className="p-5">
        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleCreatePoll}
          disabled={!isValid || isLoading}
          loading={isLoading || isImageUploading}
        >
          <Typo.ButtonText>
            {isLoading ? "생성 중..." : isImageUploading ? "이미지 업로드 중..." : "폴 만들기"}
          </Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}

"use client";

import {
  multiplePollCategoryAtom,
  multiplePollEndTimeAtom,
  multiplePollEndDateAtom,
  multiplePollStartTimeAtom,
  multiplePollStartDateAtom,
  multiplePollThumbnailUrlAtom,
  multiplePollThumbnailFileUploadIdAtom,
  multiplePollDescriptionAtom,
  multiplePollTitleAtom,
  multiplePollIsUnlimitedAtom,
} from "@/atoms/create/multiplePollAtoms";
import { multiplePollSchema } from "@/schemas/multiplePollSchema";
import { Button, Typo, FixedBottomLayout, toast } from "@repo/ui/components";
import { useMultiplePollSubmit } from "@/hooks/poll/useMultiplePollSubmit";
import { OptionSelector } from "@/app/poll/create/OptionSelector";
import { CategoryButton } from "./components/CategoryButton";
import { ThumbnailSelector } from "./components/ThumbnailSelector";
import { SubjectInput } from "./components/SubjectInput";
import { DescriptionInput } from "./components/DescriptionInput";
import { VotingPeriodSection } from "./components/VotingPeriodSection";

const CREATE_MULTIPLE_POLL_MESSAGES = {
  success: "폴 만들기 성공했어요.",
  error: "폴 만들기 실패했어요.",
} as const;

export function MultipleInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <CategoryButton categoryAtom={multiplePollCategoryAtom} />
        <ThumbnailSelector
          thumbnailUrlAtom={multiplePollThumbnailUrlAtom}
          thumbnailFileUploadIdAtom={multiplePollThumbnailFileUploadIdAtom}
        />
        <SubjectInput
          titleAtom={multiplePollTitleAtom}
          schema={multiplePollSchema}
        />
        <DescriptionInput descriptionAtom={multiplePollDescriptionAtom} />
        <OptionSelector />
      </div>

      {/* DIVIDER */}
      <div className="bg-zinc-50 w-full h-2" />

      <div className="flex flex-col gap-6 px-5">
        <VotingPeriodSection
          isUnlimitedAtom={multiplePollIsUnlimitedAtom}
          startDateAtom={multiplePollStartDateAtom}
          startTimeAtom={multiplePollStartTimeAtom}
          endDateAtom={multiplePollEndDateAtom}
          endTimeAtom={multiplePollEndTimeAtom}
        />
      </div>

      <MultipleInfoCTAButton />
    </div>
  );
}

function MultipleInfoCTAButton() {
  const { isValid, handleSubmit, isLoading, isImageUploading } =
    useMultiplePollSubmit({
      onSuccess: () => {
        toast.success(CREATE_MULTIPLE_POLL_MESSAGES.success);
      },
      onError: () => {
        toast.error(CREATE_MULTIPLE_POLL_MESSAGES.error);
      },
    });

  const handleClick = () => {
    handleSubmit();
  };

  return (
    <FixedBottomLayout.Content>
      <div className="p-5 pb-10">
        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleClick}
          disabled={!isValid || isLoading}
          loading={isLoading || isImageUploading}
        >
          <Typo.ButtonText>
            {isLoading
              ? "폴 생성 중..."
              : isImageUploading
                ? "이미지 업로드 중..."
                : "폴 만들기"}
          </Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}

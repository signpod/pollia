"use client";

import { Input } from "@repo/ui/components";
import { Controller, useFormContext } from "react-hook-form";
import {
  type CreateMissionFormData,
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "../schema";
import { CreateContentTogglesStep } from "./CreateContentTogglesStep";
import { CreateRewardSettingsStep } from "./CreateRewardSettingsStep";
import { CreateTiptapField } from "./CreateTiptapField";

interface CreateContentInfoStepProps {
  showRewardSettings?: boolean;
  showAiCompletionToggle?: boolean;
  hideToggles?: boolean;
}

export function CreateContentInfoStep({
  showRewardSettings = false,
  showAiCompletionToggle = false,
  hideToggles = false,
}: CreateContentInfoStepProps = {}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateMissionFormData>();

  return (
    <div className="flex flex-col gap-6">
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            label="콘텐츠 제목"
            required
            placeholder="제목을 입력해주세요"
            maxLength={MISSION_TITLE_MAX_LENGTH}
            errorMessage={errors.title?.message}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <CreateTiptapField
        name="description"
        label="설명"
        description="콘텐츠에 대한 설명을 입력해주세요."
        placeholder="콘텐츠에 대한 설명을 입력해주세요"
        isOptional
        maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
        showCounter
        showToolbar
      />

      {!hideToggles && <CreateContentTogglesStep showAiCompletionToggle={showAiCompletionToggle} />}

      {showRewardSettings ? <CreateRewardSettingsStep /> : null}
    </div>
  );
}

"use client";

import { Input } from "@repo/ui/components";
import { Controller, useFormContext } from "react-hook-form";
import {
  type CreateMissionFormData,
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "../schema";
import { CreateProjectTogglesStep } from "./CreateProjectTogglesStep";
import { CreateRewardSettingsStep } from "./CreateRewardSettingsStep";
import { CreateTiptapField } from "./CreateTiptapField";

interface CreateProjectInfoStepProps {
  showRewardSettings?: boolean;
  showAiCompletionToggle?: boolean;
  hideToggles?: boolean;
}

export function CreateProjectInfoStep({
  showRewardSettings = false,
  showAiCompletionToggle = false,
  hideToggles = false,
}: CreateProjectInfoStepProps = {}) {
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
            label="프로젝트 제목"
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
        description="프로젝트에 대한 설명을 입력해주세요."
        placeholder="프로젝트에 대한 설명을 입력해주세요"
        isOptional
        maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
        showCounter
        showToolbar
      />

      {!hideToggles && <CreateProjectTogglesStep showAiCompletionToggle={showAiCompletionToggle} />}

      {showRewardSettings ? <CreateRewardSettingsStep /> : null}
    </div>
  );
}

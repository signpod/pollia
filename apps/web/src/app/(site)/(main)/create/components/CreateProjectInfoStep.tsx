"use client";

import { Input } from "@repo/ui/components";
import { Sparkles } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  type CreateMissionFormData,
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "../schema";
import { CreateRewardSettingsStep } from "./CreateRewardSettingsStep";
import { CreateTiptapField } from "./CreateTiptapField";
import { ToggleSettingRow } from "./ToggleSettingRow";

interface CreateProjectInfoStepProps {
  showRewardSettings?: boolean;
  showAiCompletionToggle?: boolean;
}

export function CreateProjectInfoStep({
  showRewardSettings = false,
  showAiCompletionToggle = false,
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

      <Controller
        control={control}
        name="allowGuestResponse"
        render={({ field }) => (
          <ToggleSettingRow
            label="비회원 참여 허용"
            description="비회원(게스트)도 참여할 수 있도록 허용합니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="allowMultipleResponses"
        render={({ field }) => (
          <ToggleSettingRow
            label="다중 응답 허용"
            description="동일 사용자가 여러 번 응답할 수 있도록 허용합니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {showAiCompletionToggle ? (
        <Controller
          control={control}
          name="useAiCompletion"
          render={({ field }) => (
            <ToggleSettingRow
              label="AI 완료화면 사용"
              description="완료 화면 연결이 없어도 AI가 응답 기반으로 완료 화면을 결정합니다."
              checked={field.value}
              onChange={field.onChange}
              badgeLabel="AI 기능"
              badgeIcon={<Sparkles className="size-3" />}
            />
          )}
        />
      ) : null}

      {showRewardSettings ? <CreateRewardSettingsStep /> : null}
    </div>
  );
}

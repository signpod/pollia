"use client";

import { Badge } from "@/components/ui/badge";
import { Input, Toggle, Typo } from "@repo/ui/components";
import { Sparkles } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  type CreateMissionFormData,
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "../schema";
import { CreateRewardSettingsStep } from "./CreateRewardSettingsStep";
import { CreateTiptapField } from "./CreateTiptapField";

function IntroToggleRow({
  label,
  description,
  checked,
  onChange,
  badgeLabel,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badgeLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typo.SubTitle>{label}</Typo.SubTitle>
            {badgeLabel ? (
              <Badge
                variant="outline"
                className="border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100"
              >
                <Sparkles className="size-3" />
                {badgeLabel}
              </Badge>
            ) : null}
          </div>
          <Typo.Body size="medium" className="text-zinc-500">
            {description}
          </Typo.Body>
        </div>
        <Toggle checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
}

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
          <IntroToggleRow
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
          <IntroToggleRow
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
            <IntroToggleRow
              label="AI 완료화면 사용"
              description="완료 화면 연결이 없어도 AI가 응답 기반으로 완료 화면을 결정합니다."
              checked={field.value}
              onChange={field.onChange}
              badgeLabel="AI 기능"
            />
          )}
        />
      ) : null}

      {showRewardSettings ? <CreateRewardSettingsStep /> : null}
    </div>
  );
}

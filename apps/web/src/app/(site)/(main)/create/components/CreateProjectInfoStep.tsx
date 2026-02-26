"use client";

import { Input, Toggle, Typo } from "@repo/ui/components";
import { Controller, useFormContext } from "react-hook-form";
import {
  type CreateMissionFormData,
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "../schema";
import { CreateTiptapField } from "./CreateTiptapField";

function IntroToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typo.SubTitle>{label}</Typo.SubTitle>
          <Typo.Body size="medium" className="text-zinc-500">
            {description}
          </Typo.Body>
        </div>
        <Toggle checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
}

export function CreateProjectInfoStep() {
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
        name="isActive"
        render={({ field }) => (
          <IntroToggleRow
            label="활성 상태"
            description="프로젝트를 활성화하거나 비활성화합니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="isExposed"
        render={({ field }) => (
          <IntroToggleRow
            label="노출여부"
            description="노출 시 프로젝트 목록에 표시됩니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
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
    </div>
  );
}

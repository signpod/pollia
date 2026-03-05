"use client";

import { Sparkles } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import type { CreateMissionFormData } from "../schema";
import { ToggleSettingRow } from "./ToggleSettingRow";

interface CreateProjectTogglesStepProps {
  showAiCompletionToggle?: boolean;
  useMemberOnlyMode?: boolean;
}

export function CreateProjectTogglesStep({
  showAiCompletionToggle = false,
  useMemberOnlyMode = false,
}: CreateProjectTogglesStepProps) {
  const { control } = useFormContext<CreateMissionFormData>();

  return (
    <>
      <Controller
        control={control}
        name="allowGuestResponse"
        render={({ field }) =>
          useMemberOnlyMode ? (
            <ToggleSettingRow
              label="회원 전용"
              description="회원만 참여할 수 있도록 제한합니다."
              checked={!field.value}
              onChange={checked => field.onChange(!checked)}
            />
          ) : (
            <ToggleSettingRow
              label="비회원 참여 허용"
              description="비회원(게스트)도 참여할 수 있도록 허용합니다."
              checked={field.value}
              onChange={field.onChange}
            />
          )
        }
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
    </>
  );
}

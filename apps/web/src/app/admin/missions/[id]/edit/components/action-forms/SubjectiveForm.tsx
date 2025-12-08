"use client";

import { BaseActionForm } from "./BaseActionForm";
import type { ActionFormProps, BaseActionFormData, SubjectiveFormData } from "./types";

export function SubjectiveForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<SubjectiveFormData>) {
  const handleSubmit = (baseData: BaseActionFormData) => {
    onSubmit({
      ...baseData,
      type: "SUBJECTIVE",
    });
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 개선되었으면 하는 점을 자유롭게 작성해주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* TODO: 주관식 폼 구현 - 최대 글자수, 플레이스홀더 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">주관식 설정 영역</p>
        <p className="text-xs mt-1">최대 글자수, 플레이스홀더 텍스트 등</p>
      </div>
    </BaseActionForm>
  );
}

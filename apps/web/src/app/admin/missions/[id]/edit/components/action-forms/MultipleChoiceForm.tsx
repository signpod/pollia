"use client";

import { BaseActionForm } from "./BaseActionForm";
import type { ActionFormProps, BaseActionFormData, MultipleChoiceFormData } from "./types";

export function MultipleChoiceForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<MultipleChoiceFormData>) {
  const handleSubmit = (baseData: BaseActionFormData) => {
    onSubmit({
      ...baseData,
      type: "MULTIPLE_CHOICE",
      options: [],
    });
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 가장 선호하는 옵션을 선택해주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* TODO: 객관식 폼 구현 - 선택지 추가/삭제, 최대 선택 개수 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">객관식 선택지 설정 영역</p>
        <p className="text-xs mt-1">선택지 추가, 최대 선택 개수 등</p>
      </div>
    </BaseActionForm>
  );
}

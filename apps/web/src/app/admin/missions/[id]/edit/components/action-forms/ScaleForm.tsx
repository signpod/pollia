"use client";

import { BaseActionForm } from "./BaseActionForm";
import type { ActionFormProps, BaseActionFormData, ScaleFormData } from "./types";

export function ScaleForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<ScaleFormData>) {
  const handleSubmit = (baseData: BaseActionFormData) => {
    onSubmit({
      ...baseData,
      type: "SCALE",
      options: [],
    });
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 서비스 만족도를 평가해주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* TODO: 척도 폼 구현 - 최소/최대값, 라벨 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">척도 설정 영역</p>
        <p className="text-xs mt-1">최소/최대값, 양끝 라벨 등</p>
      </div>
    </BaseActionForm>
  );
}

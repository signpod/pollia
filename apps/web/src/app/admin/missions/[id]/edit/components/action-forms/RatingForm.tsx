"use client";

import { BaseActionForm } from "./BaseActionForm";
import type { ActionFormProps, BaseActionFormData, RatingFormData } from "./types";

export function RatingForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<RatingFormData>) {
  const handleSubmit = (baseData: BaseActionFormData) => {
    onSubmit({
      ...baseData,
      type: "RATING",
    });
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 이 제품에 대해 별점을 매겨주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* TODO: 평가 폼 구현 - 최대 별점 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">평가 설정 영역</p>
        <p className="text-xs mt-1">최대 별점 (3점, 5점, 10점 등)</p>
      </div>
    </BaseActionForm>
  );
}

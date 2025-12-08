"use client";

import { BaseActionForm } from "./BaseActionForm";
import type { ActionFormProps, BaseActionFormData, TagFormData } from "./types";

export function TagForm({ isLoading = false, onSubmit, onCancel }: ActionFormProps<TagFormData>) {
  const handleSubmit = (baseData: BaseActionFormData) => {
    onSubmit({
      ...baseData,
      type: "TAG",
      options: [],
    });
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 관심 있는 키워드를 선택해주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* TODO: 태그 폼 구현 - 태그 추가/삭제, 최대 선택 개수 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">태그 설정 영역</p>
        <p className="text-xs mt-1">태그 목록 추가, 최대 선택 개수 등</p>
      </div>
    </BaseActionForm>
  );
}

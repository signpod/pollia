"use client";

import { BaseActionForm } from "./BaseActionForm";
import type { ActionFormProps, BaseActionFormData, ImageUploadFormData } from "./types";

export function ImageUploadForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<ImageUploadFormData>) {
  const handleSubmit = (baseData: BaseActionFormData) => {
    onSubmit({
      ...baseData,
      type: "IMAGE",
    });
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 제품 사용 사진을 업로드해주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* TODO: 이미지 업로드 폼 구현 - 최대 파일 수, 허용 포맷 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">이미지 업로드 설정 영역</p>
        <p className="text-xs mt-1">최대 파일 수, 허용 확장자 등</p>
      </div>
    </BaseActionForm>
  );
}

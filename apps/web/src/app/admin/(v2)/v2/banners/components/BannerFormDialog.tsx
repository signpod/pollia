"use client";

import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
import type { BannerItem } from "@/types/dto/banner";
import styled from "@emotion/styled";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "../../components/ui";
import { color, fontSize, radius } from "../../components/ui/tokens";
import { useCreateBanner } from "../../hooks/banner/use-create-banner";
import { useUpdateBanner } from "../../hooks/banner/use-update-banner";

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: BannerItem | null;
}

export function BannerFormDialog({ open, onOpenChange, banner }: BannerFormDialogProps) {
  const isEdit = !!banner;
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const { previewUrl, uploadedData, isUploading, upload, discard } = useUploadImage({
    onUploadSuccess: () => {},
  });

  useEffect(() => {
    if (open) {
      setTitle(banner?.title ?? "");
      setSubtitle(banner?.subtitle ?? "");
      discard();
    }
  }, [open, banner]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleSubmit = () => {
    const imageUrl = uploadedData?.publicUrl ?? banner?.imageUrl;
    const imageFileUploadId = uploadedData?.fileUploadId ?? banner?.imageFileUploadId;

    if (!imageUrl) return;

    if (isEdit && banner) {
      updateMutation.mutate(
        {
          id: banner.id,
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          imageUrl,
          imageFileUploadId,
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        {
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          imageUrl,
          imageFileUploadId,
        },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const currentImageUrl = previewUrl ?? banner?.imageUrl;
  const canSubmit = currentImageUrl && !isUploading && !isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "배너 수정" : "배너 추가"}</DialogTitle>
      </DialogHeader>
      <FormBody>
        <FieldGroup>
          <Label>이미지</Label>
          {currentImageUrl ? (
            <PreviewContainer>
              <Image
                src={currentImageUrl}
                alt="배너 미리보기"
                fill
                style={{ objectFit: "cover" }}
              />
            </PreviewContainer>
          ) : (
            <PlaceholderBox>이미지를 업로드해주세요</PlaceholderBox>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "업로드 중..." : "이미지 선택"}
          </Button>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="banner-title">제목</Label>
          <Input
            id="banner-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="배너 제목"
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="banner-subtitle">부제목 (선택)</Label>
          <Input
            id="banner-subtitle"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="배너 부제목"
          />
        </FieldGroup>
      </FormBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isPending ? "저장 중..." : isEdit ? "수정" : "추가"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  border-radius: ${radius.md};
  border: 1px solid ${color.gray200};
`;

const PlaceholderBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: ${radius.md};
  border: 1px dashed ${color.gray300};
  font-size: ${fontSize.sm};
  color: ${color.gray400};
`;

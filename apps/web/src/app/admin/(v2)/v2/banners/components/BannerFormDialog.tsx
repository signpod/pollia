"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
import type { BannerItem } from "@/types/dto/banner";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "배너 수정" : "배너 추가"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>이미지</Label>
            {currentImageUrl ? (
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md border">
                <Image src={currentImageUrl} alt="배너 미리보기" fill className="object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                이미지를 업로드해주세요
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-title">제목</Label>
            <Input
              id="banner-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="배너 제목"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-subtitle">부제목 (선택)</Label>
            <Input
              id="banner-subtitle"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="배너 부제목"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isPending ? "저장 중..." : isEdit ? "수정" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

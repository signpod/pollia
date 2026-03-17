"use client";

import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageCropper } from "@/app/admin/components/common/cropper/use-image-cropper";
import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useCreateBanner } from "../../hooks/banner/use-create-banner";

const BANNER_ASPECT = 3 / 2;

export function BannerAddRow() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateBanner();
  const cropper = useImageCropper({ fileNamePrefix: "banner" });
  const { previewUrl, uploadedData, isUploading, upload, discard } = useUploadImage({
    bucket: STORAGE_BUCKETS.BANNER_IMAGES,
  });

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    discard();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) cropper.openWithFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    const imageUrl = uploadedData?.publicUrl;
    const imageFileUploadId = uploadedData?.fileUploadId;
    if (!imageUrl) return;
    createMutation.mutate(
      { title: title.trim(), subtitle: subtitle.trim() || null, imageUrl, imageFileUploadId },
      { onSuccess: () => resetForm() },
    );
  };

  const isPending = createMutation.isPending;
  const canSubmit = !!previewUrl && !isUploading && !isPending;

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        bgcolor: "grey.50",
        borderStyle: "dashed",
      }}
    >
      <Avatar sx={{ width: 28, height: 28, bgcolor: "grey.200", color: "text.secondary" }}>
        <Plus size={14} />
      </Avatar>
      {previewUrl ? (
        <Box
          sx={{
            width: 96,
            height: 64,
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={previewUrl}
            alt="새 배너"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      ) : (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: 96,
            height: 64,
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "grey.300",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "text.secondary",
            fontSize: "1.25rem",
            flexShrink: 0,
            "&:hover": { borderColor: "grey.400" },
          }}
        >
          {isUploading ? "..." : "+"}
        </Box>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {previewUrl && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          변경
        </Button>
      )}
      <TextField
        size="small"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="제목"
        sx={{ flex: 1 }}
      />
      <TextField
        size="small"
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        placeholder="부제목 (선택)"
        sx={{ flex: 1 }}
      />
      <Button
        size="small"
        variant="contained"
        startIcon={<Plus size={14} />}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {isPending ? "추가 중..." : "추가"}
      </Button>
      <AdminImageCropDialog
        open={cropper.isOpen}
        imageSrc={cropper.imageSrc}
        aspect={BANNER_ASPECT}
        title="배너 이미지 편집"
        description="3:2 비율로 이미지를 편집합니다."
        fileName={cropper.fileName ?? "banner.jpg"}
        onOpenChange={open => {
          if (!open) cropper.close();
        }}
        onConfirm={upload}
      />
    </Card>
  );
}

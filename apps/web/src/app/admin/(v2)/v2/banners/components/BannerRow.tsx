"use client";

import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageCropper } from "@/app/admin/components/common/cropper/use-image-cropper";
import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { BannerItem } from "@/types/dto/banner";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDeleteBanner } from "../../hooks/banner/use-delete-banner";
import { useUpdateBanner } from "../../hooks/banner/use-update-banner";
import { BANNER_ASPECT } from "../constants";

interface BannerRowProps {
  banner: BannerItem;
  index: number;
  total: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onMove: (direction: "up" | "down") => void;
  isMoveDisabled: boolean;
}

export function BannerRow({
  banner,
  index,
  total,
  isEditing,
  onEdit,
  onCancelEdit,
  onMove,
  isMoveDisabled,
}: BannerRowProps) {
  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const cropper = useImageCropper({ fileNamePrefix: "banner" });
  const { previewUrl, uploadedData, isUploading, upload, discard, reset } = useUploadImage({
    bucket: STORAGE_BUCKETS.BANNER_IMAGES,
    onUploadError: () => toast.error("이미지 업로드에 실패했습니다."),
  });

  useEffect(() => {
    if (isEditing) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle ?? "");
      reset();
    }
  }, [isEditing, banner.title, banner.subtitle, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) cropper.openWithFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    const imageUrl = uploadedData?.publicUrl ?? banner.imageUrl;
    const imageFileUploadId = uploadedData?.fileUploadId ?? banner.imageFileUploadId;
    updateMutation.mutate(
      {
        id: banner.id,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        imageUrl,
        imageFileUploadId,
      },
      {
        onSuccess: () => onCancelEdit(),
        onError: () => toast.error("배너 수정에 실패했습니다."),
      },
    );
  };

  const isPending = updateMutation.isPending;

  if (isEditing) {
    return (
      <Card
        variant="outlined"
        sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderColor: "primary.main" }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: "0.75rem",
            bgcolor: "grey.200",
            color: "text.secondary",
          }}
        >
          {index + 1}
        </Avatar>
        <Box
          sx={{
            position: "relative",
            width: 96,
            height: 64,
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="배너"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="96px"
            />
          )}
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          size="small"
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "..." : "이미지 변경"}
        </Button>
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
          startIcon={<Check size={14} />}
          onClick={handleSave}
          disabled={isPending || isUploading}
        >
          {isPending ? "저장 중..." : "저장"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<X size={14} />}
          onClick={() => {
            discard();
            onCancelEdit();
          }}
          disabled={isPending}
        >
          취소
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

  return (
    <Card variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5 }}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: "0.75rem",
          bgcolor: "grey.200",
          color: "text.secondary",
        }}
      >
        {index + 1}
      </Avatar>
      <Box
        sx={{
          position: "relative",
          width: 96,
          height: 64,
          borderRadius: 1,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          style={{ objectFit: "cover" }}
          sizes="96px"
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={500} noWrap>
          {banner.title || "(제목 없음)"}
        </Typography>
        {banner.subtitle && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {banner.subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <IconButton
          size="small"
          onClick={() => onMove("up")}
          disabled={index === 0 || isMoveDisabled}
        >
          <ArrowUp size={16} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onMove("down")}
          disabled={index === total - 1 || isMoveDisabled}
        >
          <ArrowDown size={16} />
        </IconButton>
      </Box>
      <IconButton size="small" onClick={onEdit}>
        <Pencil size={16} />
      </IconButton>
      <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)}>
        <Trash2 size={16} />
      </IconButton>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>배너 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>이 배너를 삭제합니다. 되돌릴 수 없습니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>취소</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteMutation.mutate(banner.id, { onSuccess: () => setDeleteOpen(false) })
            }
            disabled={deleteMutation.isPending}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

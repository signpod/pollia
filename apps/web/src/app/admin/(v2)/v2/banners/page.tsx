"use client";

import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
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
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAdminBanners } from "../hooks/banner/use-admin-banners";
import { useCreateBanner } from "../hooks/banner/use-create-banner";
import { useDeleteBanner } from "../hooks/banner/use-delete-banner";
import { useReorderBanners } from "../hooks/banner/use-reorder-banners";
import { useUpdateBanner } from "../hooks/banner/use-update-banner";

function BannerRow({
  banner,
  index,
  total,
  isEditing,
  onEdit,
  onCancelEdit,
  onMove,
  isMoveDisabled,
}: {
  banner: BannerItem;
  index: number;
  total: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onMove: (direction: "up" | "down") => void;
  isMoveDisabled: boolean;
}) {
  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const { previewUrl, uploadedData, isUploading, upload, discard } = useUploadImage({
    onUploadSuccess: () => {},
  });

  useEffect(() => {
    if (isEditing) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle ?? "");
      discard();
    }
  }, [isEditing, banner.title, banner.subtitle, discard]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
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
      { onSuccess: () => onCancelEdit() },
    );
  };

  const currentImageUrl = previewUrl ?? banner.imageUrl;
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
            height: 60,
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src={currentImageUrl}
            alt="배너"
            fill
            style={{ objectFit: "cover" }}
            sizes="96px"
          />
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
          height: 60,
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

function BannerAddRow() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateBanner();
  const { previewUrl, uploadedData, isUploading, upload, discard } = useUploadImage({
    onUploadSuccess: () => {},
  });

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    discard();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
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
            position: "relative",
            width: 96,
            height: 60,
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image src={previewUrl} alt="새 배너" fill style={{ objectFit: "cover" }} sizes="96px" />
        </Box>
      ) : (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: 96,
            height: 60,
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
    </Card>
  );
}

export default function AdminV2BannersPage() {
  const { data, isLoading } = useAdminBanners();
  const reorderMutation = useReorderBanners();
  const [editingId, setEditingId] = useState<string | null>(null);

  const banners = data?.data ?? [];

  const handleMove = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const orders = banners.map((b, i) => {
      if (i === index) return { id: b.id, order: (banners[swapIndex] as BannerItem).order };
      if (i === swapIndex) return { id: b.id, order: (banners[index] as BannerItem).order };
      return { id: b.id, order: b.order };
    });
    reorderMutation.mutate({ orders });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h1">배너 관리</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {isLoading ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            불러오는 중...
          </Typography>
        ) : banners.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            등록된 배너가 없습니다.
          </Typography>
        ) : (
          banners.map((banner, index) => (
            <BannerRow
              key={banner.id}
              banner={banner}
              index={index}
              total={banners.length}
              isEditing={editingId === banner.id}
              onEdit={() => setEditingId(banner.id)}
              onCancelEdit={() => setEditingId(null)}
              onMove={dir => handleMove(index, dir)}
              isMoveDisabled={reorderMutation.isPending}
            />
          ))
        )}
        <BannerAddRow />
      </Box>
    </Box>
  );
}

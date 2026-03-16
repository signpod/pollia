"use client";

import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useCreateBanner } from "../../hooks/banner/use-create-banner";

export function BannerAddRow() {
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

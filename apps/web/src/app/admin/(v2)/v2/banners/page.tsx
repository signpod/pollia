"use client";

import { useUploadImage } from "@/app/admin/hooks/admin-image/use-upload-image";
import type { BannerItem } from "@/types/dto/banner";
import styled from "@emotion/styled";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
} from "../components/ui";
import { color, fontSize, radius, shadow } from "../components/ui/tokens";
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

  const handleCancel = () => {
    discard();
    onCancelEdit();
  };

  const currentImageUrl = previewUrl ?? banner.imageUrl;
  const isPending = updateMutation.isPending;

  if (isEditing) {
    return (
      <RowCard editing>
        <OrderBadge>{index + 1}</OrderBadge>
        <ImageArea>
          <ImageThumb>
            <Image
              src={currentImageUrl}
              alt="배너"
              fill
              style={{ objectFit: "cover" }}
              sizes="96px"
            />
          </ImageThumb>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "..." : "변경"}
          </Button>
        </ImageArea>
        <FieldsArea>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
          <Input
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="부제목 (선택)"
          />
        </FieldsArea>
        <ActionsArea>
          <Button size="sm" onClick={handleSave} disabled={isPending || isUploading}>
            <Check size={14} />
            {isPending ? "저장 중..." : "저장"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
            <X size={14} />
            취소
          </Button>
        </ActionsArea>
      </RowCard>
    );
  }

  return (
    <RowCard>
      <OrderBadge>{index + 1}</OrderBadge>
      <ImageArea>
        <ImageThumb>
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            style={{ objectFit: "cover" }}
            sizes="96px"
          />
        </ImageThumb>
      </ImageArea>
      <TextArea>
        <BannerTitle>{banner.title || "(제목 없음)"}</BannerTitle>
        {banner.subtitle && <BannerSubtitle>{banner.subtitle}</BannerSubtitle>}
      </TextArea>
      <ActionsArea>
        <MoveButtons>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove("up")}
            disabled={index === 0 || isMoveDisabled}
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove("down")}
            disabled={index === total - 1 || isMoveDisabled}
          >
            <ArrowDown size={14} />
          </Button>
        </MoveButtons>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil size={14} />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="ghost" size="icon">
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>배너 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 배너를 삭제합니다. 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(banner.id)}
                disabled={deleteMutation.isPending}
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ActionsArea>
    </RowCard>
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
    <RowCard add>
      <OrderBadge>
        <Plus size={14} />
      </OrderBadge>
      <ImageArea>
        {previewUrl ? (
          <ImageThumb>
            <Image
              src={previewUrl}
              alt="새 배너"
              fill
              style={{ objectFit: "cover" }}
              sizes="96px"
            />
          </ImageThumb>
        ) : (
          <PlaceholderThumb onClick={() => fileInputRef.current?.click()}>
            {isUploading ? "..." : "+"}
          </PlaceholderThumb>
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
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            변경
          </Button>
        )}
      </ImageArea>
      <FieldsArea>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
        <Input
          value={subtitle}
          onChange={e => setSubtitle(e.target.value)}
          placeholder="부제목 (선택)"
        />
      </FieldsArea>
      <ActionsArea>
        <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
          <Plus size={14} />
          {isPending ? "추가 중..." : "추가"}
        </Button>
      </ActionsArea>
    </RowCard>
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
    <PageWrapper>
      <PageTitle>배너 관리</PageTitle>

      <ListWrapper>
        {isLoading ? (
          <EmptyMessage>불러오는 중...</EmptyMessage>
        ) : banners.length === 0 ? (
          <EmptyMessage>등록된 배너가 없습니다.</EmptyMessage>
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
      </ListWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: ${fontSize["2xl"]};
  font-weight: 700;
  color: ${color.gray900};
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RowCard = styled.div<{ editing?: boolean; add?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid ${({ editing }) => (editing ? color.blue500 : color.gray200)};
  border-radius: ${radius.md};
  background: ${({ add }) => (add ? color.gray50 : color.white)};
  ${({ editing }) => editing && `box-shadow: ${shadow.sm};`}
`;

const OrderBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${radius.full};
  background: ${color.gray100};
  color: ${color.gray500};
  font-size: ${fontSize.xs};
  font-weight: 600;
  flex-shrink: 0;
`;

const ImageArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
`;

const ImageThumb = styled.div`
  position: relative;
  width: 96px;
  height: 60px;
  overflow: hidden;
  border-radius: ${radius.sm};
`;

const PlaceholderThumb = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 60px;
  border-radius: ${radius.sm};
  border: 1px dashed ${color.gray300};
  color: ${color.gray400};
  font-size: ${fontSize.lg};
  cursor: pointer;

  &:hover {
    border-color: ${color.gray400};
    color: ${color.gray500};
  }
`;

const TextArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const BannerTitle = styled.span`
  font-size: ${fontSize.sm};
  font-weight: 500;
  color: ${color.gray800};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BannerSubtitle = styled.span`
  font-size: ${fontSize.xs};
  color: ${color.gray400};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldsArea = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const ActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const MoveButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: ${color.gray400};
  font-size: ${fontSize.sm};
`;

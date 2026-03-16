"use client";

import type { BannerItem } from "@/types/dto/banner";
import styled from "@emotion/styled";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui";
import { color, fontSize, radius } from "../components/ui/tokens";
import { useAdminBanners } from "../hooks/banner/use-admin-banners";
import { useDeleteBanner } from "../hooks/banner/use-delete-banner";
import { useReorderBanners } from "../hooks/banner/use-reorder-banners";
import { BannerFormDialog } from "./components/BannerFormDialog";

function DeleteBannerButton({ id }: { id: string }) {
  const mutation = useDeleteBanner();

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="ghost" size="icon">
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>배너 삭제</AlertDialogTitle>
          <AlertDialogDescription>이 배너를 삭제합니다. 되돌릴 수 없습니다.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate(id)} disabled={mutation.isPending}>
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminV2BannersPage() {
  const { data, isLoading } = useAdminBanners();
  const reorderMutation = useReorderBanners();
  const [formOpen, setFormOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<BannerItem | null>(null);

  const banners = data?.data ?? [];

  const handleMove = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const orders = banners.map((b, i) => {
      if (i === index) return { id: b.id, order: banners[swapIndex]!.order };
      if (i === swapIndex) return { id: b.id, order: banners[index]!.order };
      return { id: b.id, order: b.order };
    });

    reorderMutation.mutate({ orders });
  };

  const handleEdit = (banner: BannerItem) => {
    setEditBanner(banner);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditBanner(null);
    setFormOpen(true);
  };

  return (
    <PageWrapper>
      <HeaderRow>
        <PageTitle>배너 관리</PageTitle>
        <Button onClick={handleCreate}>
          <Plus size={16} />
          배너 추가
        </Button>
      </HeaderRow>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 60 }}>순서</TableHead>
              <TableHead style={{ width: 120 }}>이미지</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>부제목</TableHead>
              <TableHead style={{ width: 100 }}>순서 변경</TableHead>
              <TableHead style={{ width: 80 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <EmptyCell colSpan={6}>불러오는 중...</EmptyCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <EmptyCell colSpan={6}>등록된 배너가 없습니다.</EmptyCell>
              </TableRow>
            ) : (
              banners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell center>{index + 1}</TableCell>
                  <TableCell>
                    <ImageThumb>
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="96px"
                      />
                    </ImageThumb>
                  </TableCell>
                  <TableCell style={{ fontWeight: 500 }}>{banner.title}</TableCell>
                  <TableCell style={{ color: color.gray500 }}>{banner.subtitle ?? "-"}</TableCell>
                  <TableCell>
                    <ActionRow>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0 || reorderMutation.isPending}
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === banners.length - 1 || reorderMutation.isPending}
                      >
                        <ArrowDown size={16} />
                      </Button>
                    </ActionRow>
                  </TableCell>
                  <TableCell>
                    <ActionRow>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                        <Pencil size={16} />
                      </Button>
                      <DeleteBannerButton id={banner.id} />
                    </ActionRow>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <BannerFormDialog open={formOpen} onOpenChange={setFormOpen} banner={editBanner} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  font-size: ${fontSize["2xl"]};
  font-weight: 700;
  color: ${color.gray900};
`;

const TableContainer = styled.div`
  border: 1px solid ${color.gray200};
  border-radius: ${radius.md};
  overflow: hidden;
`;

const EmptyCell = styled.td`
  height: 96px;
  text-align: center;
  color: ${color.gray400};
  padding: 12px 16px;
`;

const ImageThumb = styled.div`
  position: relative;
  height: 64px;
  width: 96px;
  overflow: hidden;
  border-radius: ${radius.sm};
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

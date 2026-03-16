"use client";

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
} from "@/app/admin/components/shadcn-ui/alert-dialog";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/admin/components/shadcn-ui/table";
import type { BannerItem } from "@/types/dto/banner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAdminBanners } from "../hooks/banner/use-admin-banners";
import { useDeleteBanner } from "../hooks/banner/use-delete-banner";
import { useReorderBanners } from "../hooks/banner/use-reorder-banners";
import { BannerFormDialog } from "./components/BannerFormDialog";

function DeleteBannerButton({ id }: { id: string }) {
  const mutation = useDeleteBanner();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">배너 관리</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          배너 추가
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">순서</TableHead>
              <TableHead className="w-[120px]">이미지</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>부제목</TableHead>
              <TableHead className="w-[100px]">순서 변경</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  등록된 배너가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="relative h-16 w-24 overflow-hidden rounded">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell className="text-muted-foreground">{banner.subtitle ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0 || reorderMutation.isPending}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === banners.length - 1 || reorderMutation.isPending}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => handleEdit(banner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteBannerButton id={banner.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BannerFormDialog open={formOpen} onOpenChange={setFormOpen} banner={editBanner} />
    </div>
  );
}

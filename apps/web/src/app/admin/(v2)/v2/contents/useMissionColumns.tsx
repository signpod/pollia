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
import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { AdminMissionItem } from "@/types/dto/admin-mission";
import { MissionType } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useAdminDeleteMission } from "../hooks/mission/use-admin-delete-mission";

function resolveVisibilityLabel(isActive: boolean, type: MissionType) {
  if (!isActive) return { label: "나만보기", className: "bg-zinc-100 text-zinc-600" };
  if (type === MissionType.GENERAL)
    return { label: "전체공개", className: "bg-green-100 text-green-700" };
  return { label: "링크만공개", className: "bg-blue-100 text-blue-700" };
}

function DeleteMissionButton({ missionId }: { missionId: string }) {
  const mutation = useAdminDeleteMission();

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
          <AlertDialogTitle>콘텐츠 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            이 콘텐츠를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다. 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate(missionId)}
            disabled={mutation.isPending}
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useMissionColumns(): ColumnDef<AdminMissionItem, unknown>[] {
  return useMemo(
    () => [
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => (
          <span className="max-w-[300px] truncate block">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "카테고리",
        cell: ({ row }) => (
          <Badge variant="outline">
            {MISSION_CATEGORY_LABELS[row.original.category] ?? row.original.category}
          </Badge>
        ),
      },
      {
        id: "visibility",
        header: "공개여부",
        cell: ({ row }) => {
          const { label, className } = resolveVisibilityLabel(
            row.original.isActive,
            row.original.type,
          );
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
            >
              {label}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "생성일",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("ko-KR"),
      },
      {
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Link
            href={`/editor/missions/${row.original.id}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        ),
      },
      {
        id: "delete",
        header: "",
        cell: ({ row }) => <DeleteMissionButton missionId={row.original.id} />,
      },
    ],
    [],
  );
}

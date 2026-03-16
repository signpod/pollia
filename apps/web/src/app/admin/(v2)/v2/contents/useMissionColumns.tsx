"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { AdminMissionItem } from "@/types/dto/admin-mission";
import styled from "@emotion/styled";
import { MissionType } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
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
  Badge,
  Button,
} from "../components/ui";
import { color, fontSize, radius } from "../components/ui/tokens";
import { useAdminDeleteMission } from "../hooks/mission/use-admin-delete-mission";

type VisibilityInfo = { label: string; bg: string; fg: string };

function resolveVisibility(isActive: boolean, type: MissionType): VisibilityInfo {
  if (!isActive) return { label: "나만보기", bg: color.zinc100, fg: color.zinc600 };
  if (type === MissionType.GENERAL)
    return { label: "전체공개", bg: color.green100, fg: color.green700 };
  return { label: "링크만공개", bg: color.blue100, fg: color.blue700 };
}

function DeleteMissionButton({ missionId }: { missionId: string }) {
  const mutation = useAdminDeleteMission();

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="ghost" size="icon">
          <Trash2 size={16} />
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
        cell: ({ row }) => <TruncatedText>{row.original.title}</TruncatedText>,
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
          const v = resolveVisibility(row.original.isActive, row.original.type);
          return (
            <VisibilityBadge $bg={v.bg} $fg={v.fg}>
              {v.label}
            </VisibilityBadge>
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
          <EditLink href={`/editor/missions/${row.original.id}`}>
            <ExternalLink size={16} />
          </EditLink>
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

const TruncatedText = styled.span`
  display: block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VisibilityBadge = styled.span<{ $bg: string; $fg: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${radius.full};
  padding: 2px 8px;
  font-size: ${fontSize.xs};
  font-weight: 500;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
`;

const EditLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${color.gray400};
  &:hover {
    color: ${color.gray700};
  }
`;

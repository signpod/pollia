"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import type { AdminMissionItem } from "@/types/dto/admin-mission";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MuiLink from "@mui/material/Link";
import { MissionType } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Trash2 } from "lucide-react";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import { useAdminDeleteMission } from "../hooks/mission/use-admin-delete-mission";

function resolveVisibility(isActive: boolean, type: MissionType) {
  if (!isActive) return { label: "나만보기", color: "default" as const };
  if (type === MissionType.GENERAL) return { label: "전체공개", color: "success" as const };
  return { label: "링크만공개", color: "info" as const };
}

function DeleteMissionButton({ missionId }: { missionId: string }) {
  const mutation = useAdminDeleteMission();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="small" color="error" onClick={() => setOpen(true)} sx={{ minWidth: 0, p: 0.5 }}>
        <Trash2 size={16} />
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>콘텐츠 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 콘텐츠를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다. 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => mutation.mutate(missionId, { onSuccess: () => setOpen(false) })}
            disabled={mutation.isPending}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function useMissionColumns(): ColumnDef<AdminMissionItem, unknown>[] {
  return useMemo(
    () => [
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => (
          <span
            style={{
              display: "block",
              maxWidth: 300,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "카테고리",
        cell: ({ row }) => (
          <Chip
            label={MISSION_CATEGORY_LABELS[row.original.category] ?? row.original.category}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        id: "visibility",
        header: "공개여부",
        cell: ({ row }) => {
          const v = resolveVisibility(row.original.isActive, row.original.type);
          return <Chip label={v.label} size="small" color={v.color} />;
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
          <MuiLink
            component={NextLink}
            href={`/editor/missions/${row.original.id}`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <ExternalLink size={14} />
            수정
          </MuiLink>
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

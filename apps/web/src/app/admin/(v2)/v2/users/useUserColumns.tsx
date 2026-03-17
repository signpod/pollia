"use client";

import type { AdminUserItem } from "@/types/dto/admin-user";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { UserRole, UserStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useAdminForceWithdraw } from "../hooks/user/use-admin-force-withdraw";

function WithdrawButton({ userId, status }: { userId: string; status: UserStatus }) {
  const mutation = useAdminForceWithdraw();
  const [open, setOpen] = useState(false);

  if (status === UserStatus.WITHDRAWN) {
    return <Chip label="탈퇴됨" size="small" />;
  }

  return (
    <>
      <Button variant="outlined" color="error" size="small" onClick={() => setOpen(true)}>
        탈퇴
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>유저 강제 탈퇴</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 유저를 강제 탈퇴 처리합니다. 개인정보가 익명화되며 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => mutation.mutate(userId, { onSuccess: () => setOpen(false) })}
            disabled={mutation.isPending}
          >
            탈퇴 처리
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function useUserColumns(): ColumnDef<AdminUserItem, unknown>[] {
  return useMemo(
    () => [
      {
        accessorKey: "phone",
        header: "전화번호",
        cell: ({ row }) => row.original.phone ?? "-",
      },
      {
        accessorKey: "name",
        header: "닉네임",
      },
      {
        accessorKey: "email",
        header: "이메일",
      },
      {
        accessorKey: "role",
        header: "어드민",
        cell: ({ row }) =>
          row.original.role === UserRole.ADMIN ? (
            <Chip label="ADMIN" size="small" color="primary" />
          ) : (
            <Chip label="USER" size="small" variant="outlined" />
          ),
      },
      {
        accessorKey: "createdAt",
        header: "가입일",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("ko-KR"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <WithdrawButton userId={row.original.id} status={row.original.status} />,
      },
    ],
    [],
  );
}

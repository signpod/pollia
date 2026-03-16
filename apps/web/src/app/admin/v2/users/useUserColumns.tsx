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
import type { AdminUserItem } from "@/types/dto/admin-user";
import { UserRole, UserStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useAdminForceWithdraw } from "../hooks/user/use-admin-force-withdraw";

function WithdrawButton({ userId, status }: { userId: string; status: UserStatus }) {
  const mutation = useAdminForceWithdraw();

  if (status === UserStatus.WITHDRAWN) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        탈퇴됨
      </Badge>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-7 text-xs">
          탈퇴
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>유저 강제 탈퇴</AlertDialogTitle>
          <AlertDialogDescription>
            이 유저를 강제 탈퇴 처리합니다. 개인정보가 익명화되며 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate(userId)} disabled={mutation.isPending}>
            탈퇴 처리
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
            <Badge variant="default">ADMIN</Badge>
          ) : (
            <Badge variant="outline">USER</Badge>
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

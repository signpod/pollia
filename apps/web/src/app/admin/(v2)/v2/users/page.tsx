"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { UserStatus } from "@prisma/client";
import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "../components/data-table/DataTable";
import { DataTableToolbar } from "../components/data-table/DataTableToolbar";
import { useAdminUsers } from "../hooks/user/use-admin-users";
import { useUserColumns } from "./useUserColumns";

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: UserStatus.ACTIVE, label: "활성" },
  { value: UserStatus.WITHDRAWN, label: "탈퇴" },
] as const;

export default function AdminV2UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(UserStatus.ACTIVE);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading } = useAdminUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : (statusFilter as UserStatus),
  });

  const columns = useUserColumns();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h1">유저 관리</Typography>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }}
        searchPlaceholder="닉네임, 이메일, 전화번호 검색..."
      >
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, pageIndex: 0 }));
            }}
          >
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DataTableToolbar>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </Box>
  );
}

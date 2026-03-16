"use client";

import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "../components/data-table/DataTable";
import { DataTableToolbar } from "../components/data-table/DataTableToolbar";
import { useAdminUsers } from "../hooks/user/use-admin-users";
import { useUserColumns } from "./useUserColumns";

export default function AdminV2UsersPage() {
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading } = useAdminUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: search || undefined,
  });

  const columns = useUserColumns();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">유저 관리</h1>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }}
        searchPlaceholder="닉네임, 이메일, 전화번호 검색..."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}

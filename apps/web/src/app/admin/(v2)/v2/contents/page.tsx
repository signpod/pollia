"use client";

import styled from "@emotion/styled";
import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "../components/data-table/DataTable";
import { DataTableToolbar } from "../components/data-table/DataTableToolbar";
import { color, fontSize } from "../components/ui/tokens";
import { useAdminV2Missions } from "../hooks/mission/use-admin-v2-missions";
import { useMissionColumns } from "./useMissionColumns";

export default function AdminV2ContentsPage() {
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading } = useAdminV2Missions({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: search || undefined,
  });

  const columns = useMissionColumns();

  return (
    <PageWrapper>
      <PageTitle>콘텐츠 관리</PageTitle>
      <DataTableToolbar
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }}
        searchPlaceholder="제목 검색..."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
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

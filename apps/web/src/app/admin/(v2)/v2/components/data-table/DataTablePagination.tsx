"use client";

import styled from "@emotion/styled";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { color, fontSize } from "../ui/tokens";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number;
}

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
];

export function DataTablePagination<TData>({ table, total }: DataTablePaginationProps<TData>) {
  return (
    <Container>
      <TotalCount>총 {total.toLocaleString()}건</TotalCount>
      <Controls>
        <ControlGroup>
          <ControlLabel>페이지 크기</ControlLabel>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onChange={e => table.setPageSize(Number(e.target.value))}
            options={PAGE_SIZE_OPTIONS}
          />
        </ControlGroup>
        <PageInfo>
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 페이지
        </PageInfo>
        <NavButtons>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight size={16} />
          </Button>
        </NavButtons>
      </Controls>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
`;

const TotalCount = styled.span`
  font-size: ${fontSize.sm};
  color: ${color.gray500};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlLabel = styled.span`
  font-size: ${fontSize.sm};
  font-weight: 500;
  color: ${color.gray700};
`;

const PageInfo = styled.span`
  font-size: ${fontSize.sm};
  font-weight: 500;
  color: ${color.gray700};
  min-width: 100px;
  text-align: center;
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

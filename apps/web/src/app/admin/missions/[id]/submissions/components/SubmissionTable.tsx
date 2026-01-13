"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/admin/components/shadcn-ui/table";
import type { ColumnDef, SubmissionRow } from "@/server/services/submission-list";

interface SubmissionTableProps {
  columns: ColumnDef[];
  rows: SubmissionRow[];
  timeLabel: string;
  emptyMessage: string;
}

export function SubmissionTable({ columns, rows, timeLabel, emptyMessage }: SubmissionTableProps) {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg">{emptyMessage}</div>
    );
  }

  return (
    <Table className="mb-4">
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>전화번호</TableHead>
          <TableHead>{timeLabel}</TableHead>
          {columns.map(column => (
            <TableHead key={column.id}>{column.title}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.user.name}</TableCell>
            <TableCell>{formatPhoneNumber(row.user.phone)}</TableCell>
            <TableCell>{formatDateTime(row.time)}</TableCell>
            {columns.map(column => {
              const answer = row.answers.find(a => a.actionId === column.id);
              return (
                <TableCell key={column.id}>
                  {formatAnswerValue(answer?.value, column.type)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return "-";
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }
  return phone;
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAnswerValue(value: string | null | undefined, type: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (type === "IMAGE" || type === "VIDEO" || type === "PDF") {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline">
        파일 보기
      </a>
    );
  }

  if (value.length > 50) {
    return <span title={value}>{value.slice(0, 50)}...</span>;
  }

  return value;
}

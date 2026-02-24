"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/admin/components/shadcn-ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/admin/components/shadcn-ui/tooltip";
import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import type { ColumnDef, SubmissionRow } from "@/server/services/submission-list";
import { CheckIcon, ClockIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

interface SubmissionTableProps {
  columns: ColumnDef[];
  rows: SubmissionRow[];
  emptyMessage: string;
}

export function SubmissionTable({ columns, rows, emptyMessage }: SubmissionTableProps) {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg">{emptyMessage}</div>
    );
  }

  const handleCellClick = (value: string | null | undefined) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success("복사되었습니다");
  };

  return (
    <Table className="mb-4">
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>전화번호</TableHead>
          <TableHead>상태</TableHead>
          {columns.map(column => (
            <TableHead key={column.id}>{column.title}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.id}>
            <ClickableCell
              value={row.user.guestId ?? row.user.name}
              onClick={handleCellClick}
              className="font-medium"
            >
              <div className="flex items-center gap-1.5">
                {row.user.name}
                {row.user.guestId && <GuestBadge guestId={row.user.guestId} />}
              </div>
            </ClickableCell>
            <ClickableCell value={formatPhoneNumber(row.user.phone)} onClick={handleCellClick}>
              {formatPhoneNumber(row.user.phone)}
            </ClickableCell>
            <TableCell>
              <StatusBadge row={row} />
            </TableCell>
            {columns.map(column => {
              const answer = row.answers.find(a => a.actionId === column.id);
              const displayValue = formatAnswerValue(answer?.value, column.type);
              return (
                <ClickableCell
                  key={column.id}
                  value={answer?.value ?? null}
                  onClick={handleCellClick}
                >
                  {displayValue}
                </ClickableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface ClickableCellProps {
  value: string | null | undefined;
  onClick: (value: string | null | undefined) => void;
  className?: string;
  children: React.ReactNode;
}

function ClickableCell({ value, onClick, className, children }: ClickableCellProps) {
  const hasCopyableValue = value && value !== "-";

  if (!hasCopyableValue) {
    return <TableCell className={className}>{children}</TableCell>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TableCell
          className={`${className ?? ""} cursor-pointer hover:bg-muted/50 transition-colors`}
          onClick={() => onClick(value)}
        >
          {children}
        </TableCell>
      </TooltipTrigger>
      <TooltipContent>클릭하여 복사</TooltipContent>
    </Tooltip>
  );
}

function StatusBadge({ row }: { row: SubmissionRow }) {
  if (row.isCompleted && row.completedAt) {
    const timeStr = formatCompactTime(new Date(row.completedAt));
    return (
      <span className="inline-flex items-center gap-1.5 text-success">
        <CheckIcon className="size-4" />
        <span className="text-sm">{timeStr}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <ClockIcon className="size-4" />
      <span className="text-sm">진행중</span>
    </span>
  );
}

function formatCompactTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) {
    return timeStr;
  }

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}.${day} ${timeStr}`;
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return "-";
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }
  return phone;
}

function GuestBadge({ guestId }: { guestId: string }) {
  const shortId = guestId.slice(0, 8);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 gap-1 font-normal text-muted-foreground"
        >
          <UserIcon className="size-2.5" />
          {shortId}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Guest ID: {guestId}</TooltipContent>
    </Tooltip>
  );
}

function formatAnswerValue(value: string | null | undefined, type: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (type === "DATE") {
    try {
      const date = new Date(value);
      return formatDateToYYYYMMDD(date);
    } catch {
      return value;
    }
  }

  if (type === "TIME") {
    try {
      const date = new Date(value);
      return formatDateToHHMM(date);
    } catch {
      return value;
    }
  }

  if (type === "IMAGE" || type === "VIDEO" || type === "PDF") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
        onClick={e => e.stopPropagation()}
      >
        파일 보기
      </a>
    );
  }

  if (value.length > 50) {
    return <span title={value}>{value.slice(0, 50)}...</span>;
  }

  return value;
}

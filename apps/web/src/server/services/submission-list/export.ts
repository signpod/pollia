import type { ColumnDef, SubmissionRow } from "./types";

export type ExportType = "completed" | "inProgress" | "all";

export interface BuildCsvContentInput {
  columns: ColumnDef[];
  completedRows: SubmissionRow[];
  inProgressRows: SubmissionRow[];
  exportType: ExportType;
}

export function buildCsvContent(input: BuildCsvContentInput): string {
  const { columns, completedRows, inProgressRows, exportType } = input;

  const headers = buildHeaders(columns, exportType);
  const rows = getRowsForExport(completedRows, inProgressRows, exportType);
  const dataRows = rows.map(row => buildDataRow(row, columns, exportType));

  return [headers, ...dataRows].map(row => row.join(",")).join("\n");
}

function buildHeaders(columns: ColumnDef[], exportType: ExportType): string[] {
  const baseHeaders = ["이름", "전화번호"];

  if (exportType === "all") {
    baseHeaders.push("상태", "시간");
  } else if (exportType === "completed") {
    baseHeaders.push("완료 시간");
  } else {
    baseHeaders.push("시작 시간");
  }

  const actionHeaders = columns.map(col => escapeCsvField(col.title));

  return [...baseHeaders, ...actionHeaders];
}

function getRowsForExport(
  completedRows: SubmissionRow[],
  inProgressRows: SubmissionRow[],
  exportType: ExportType,
): Array<{ row: SubmissionRow; isCompleted: boolean }> {
  switch (exportType) {
    case "completed":
      return completedRows.map(row => ({ row, isCompleted: true }));
    case "inProgress":
      return inProgressRows.map(row => ({ row, isCompleted: false }));
    case "all":
      return [
        ...completedRows.map(row => ({ row, isCompleted: true })),
        ...inProgressRows.map(row => ({ row, isCompleted: false })),
      ];
  }
}

function buildDataRow(
  { row, isCompleted }: { row: SubmissionRow; isCompleted: boolean },
  columns: ColumnDef[],
  exportType: ExportType,
): string[] {
  const baseData = [escapeCsvField(row.user.name), escapeCsvField(row.user.phone || "")];

  const timeValue = isCompleted && row.completedAt ? row.completedAt : row.startedAt;

  if (exportType === "all") {
    baseData.push(isCompleted ? "완료" : "진행중");
    baseData.push(formatDateTime(timeValue));
  } else {
    baseData.push(formatDateTime(timeValue));
  }

  const answerData = columns.map(col => {
    const answer = row.answers.find(a => a.actionId === col.id);
    return escapeCsvField(answer?.value || "");
  });

  return [...baseData, ...answerData];
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

"use client";

import { exportSubmissionsCsv } from "@/actions/submission-list";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import type { ExportType } from "@/server/services/submission-list";
import { useState } from "react";

interface SubmissionExportButtonProps {
  missionId: string;
  exportType: ExportType;
}

export function SubmissionExportButton({ missionId, exportType }: SubmissionExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportSubmissionsCsv(missionId, exportType);
      const csvContent = response.data;

      const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submissions_${exportType}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV 내보내기 실패:", error);
      alert("CSV 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const label =
    exportType === "completed" ? "완료자" : exportType === "inProgress" ? "진행중" : "전체";

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "내보내는 중..." : `${label} 내보내기`}
    </Button>
  );
}

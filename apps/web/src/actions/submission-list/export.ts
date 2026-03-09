"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import {
  type ExportType,
  buildCsvContent,
  buildSubmissionTables,
} from "@/server/services/submission-list";

export interface ExportSubmissionsCsvResponse {
  data: string;
}

export async function exportSubmissionsCsv(
  missionId: string,
  exportType: ExportType = "all",
): Promise<ExportSubmissionsCsvResponse> {
  try {
    await requireAdmin();

    const [responses, actions] = await Promise.all([
      missionResponseRepository.findByMissionId(missionId),
      actionRepository.findDetailsByMissionId(missionId),
    ]);

    const { columns, completedRows, inProgressRows } = buildSubmissionTables({
      responses,
      actions,
    });

    const csvContent = buildCsvContent({
      columns,
      completedRows,
      inProgressRows,
      exportType,
    });

    return { data: csvContent };
  } catch (error) {
    return handleActionError(error, "CSV 내보내기 중 오류가 발생했습니다.");
  }
}

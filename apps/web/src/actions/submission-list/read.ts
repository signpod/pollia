"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import {
  type SubmissionTablesData,
  buildSubmissionTables,
} from "@/server/services/submission-list";

export interface GetSubmissionListResponse {
  data: SubmissionTablesData;
}

export async function getSubmissionList(
  missionId: string,
  options?: { membersOnly?: boolean },
): Promise<GetSubmissionListResponse> {
  try {
    await requireAdmin();

    const [responses, actions] = await Promise.all([
      missionResponseRepository.findByMissionId(missionId, options),
      actionRepository.findDetailsByMissionId(missionId),
    ]);

    const tableData = buildSubmissionTables({ responses, actions });

    return { data: tableData };
  } catch (error) {
    return handleActionError(error, "제출 목록 조회 중 오류가 발생했습니다.");
  }
}

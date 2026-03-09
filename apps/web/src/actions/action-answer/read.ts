"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionAnswerService } from "@/server/services/action-answer";
import type {
  GetAnswersByResponseResponse,
  GetAnswersByUserResponse,
  GetQuestionAnswerResponse,
} from "@/types/dto";

export async function getAnswer(answerId: string): Promise<GetQuestionAnswerResponse> {
  try {
    const user = await requireActiveUser();
    const answer = await actionAnswerService.getAnswerById(answerId, user.id);
    const data = { ...answer, actionId: answer.action.id };
    return { data };
  } catch (error) {
    return handleActionError(error, "답변 조회 중 오류가 발생했습니다.");
  }
}

export async function getMyAnswers(): Promise<GetAnswersByUserResponse> {
  try {
    const user = await requireActiveUser();
    const answers = await actionAnswerService.getAnswersByUserId(user.id);
    const data = answers.map(answer => ({ ...answer, actionId: answer.action.id }));
    return { data };
  } catch (error) {
    return handleActionError(error, "내 답변 목록 조회 중 오류가 발생했습니다.");
  }
}

export async function getAnswersByResponse(
  responseId: string,
): Promise<GetAnswersByResponseResponse> {
  try {
    const user = await requireActiveUser();
    const answers = await actionAnswerService.getAnswersByResponseId(responseId, user.id);
    const data = answers.map(answer => ({ ...answer, actionId: answer.action.id }));
    return { data };
  } catch (error) {
    return handleActionError(error, "답변 목록 조회 중 오류가 발생했습니다.");
  }
}

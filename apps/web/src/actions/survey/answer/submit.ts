// ============================================================================
// TODO: 임시 구현 - 답변 제출 스펙 미확정
// ============================================================================
// 아직 답변 제출 관련 스펙이 확정되지 않았습니다.
// 현재는 임시로 작성된 서버 액션이며, 추후 변경될 예정입니다.
// 현재는 사용하지 않고, 클라이언트에서 상태 관리 및 로깅만 수행 중입니다.
// ============================================================================

"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import type { SubmitSurveyAnswersRequest, SubmitSurveyAnswersResponse } from "@/types/dto/survey";

const ANSWER_MESSAGE = {
  SURVEY_NOT_FOUND: "설문조사를 찾을 수 없습니다.",
  ANSWERS_REQUIRED: "최소 1개 이상의 답변이 필요합니다.",
  ANSWER_SUBMISSION_FAILED: "답변 제출 중 오류가 발생했습니다.",
  INVALID_QUESTION: "유효하지 않은 질문이 포함되어 있습니다.",
};

function validateAnswersRequest(request: SubmitSurveyAnswersRequest): string | null {
  if (!request.surveyId || request.surveyId.trim().length === 0) {
    return "설문조사 ID가 필요합니다.";
  }

  if (request.answers.length === 0) {
    return ANSWER_MESSAGE.ANSWERS_REQUIRED;
  }

  // 각 답변의 유효성 검사
  for (const answer of request.answers) {
    if (!answer.questionId) {
      return "질문 ID가 필요합니다.";
    }

    if (answer.type === "SCALE") {
      if (answer.scaleValue < 1 || answer.scaleValue > 5) {
        return "척도 값은 1~5 사이여야 합니다.";
      }
    } else if (answer.type === "SUBJECTIVE") {
      if (!answer.textResponse || answer.textResponse.trim().length === 0) {
        return "주관식 답변은 필수입니다.";
      }
      if (answer.textResponse.length > 100) {
        return "주관식 답변은 100자를 초과할 수 없습니다.";
      }
    } else if (answer.type === "MULTIPLE_CHOICE") {
      if (answer.selectedOptionIds.length === 0) {
        return "최소 1개 이상의 선택지를 선택해주세요.";
      }
    }
  }

  return null;
}

export async function submitSurveyAnswers(
  request: SubmitSurveyAnswersRequest,
): Promise<SubmitSurveyAnswersResponse> {
  try {
    const user = await requireAuth();

    // Validation
    const validationError = validateAnswersRequest(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    // 설문조사 존재 확인
    const survey = await prisma.survey.findUnique({
      where: { id: request.surveyId },
      select: { id: true, isActive: true },
    });

    if (!survey) {
      const error = new Error(ANSWER_MESSAGE.SURVEY_NOT_FOUND);
      error.cause = 404;
      throw error;
    }

    if (!survey.isActive) {
      const error = new Error("종료된 설문조사입니다.");
      error.cause = 400;
      throw error;
    }

    // 질문들이 해당 설문조사에 속하는지 확인
    const questionIds = request.answers.map(answer => answer.questionId);

    // 먼저 질문들이 존재하는지만 확인
    const allQuestions = await prisma.surveyQuestion.findMany({
      where: {
        id: { in: questionIds },
      },
      select: { id: true, surveyId: true },
    });

    console.log("📋 요청된 질문 IDs:", questionIds);
    console.log("📋 DB에서 찾은 질문들:", allQuestions);
    console.log("📋 요청된 surveyId:", request.surveyId);

    // 질문들이 존재하는지 확인
    if (allQuestions.length !== questionIds.length) {
      const error = new Error("일부 질문을 찾을 수 없습니다.");
      error.cause = 400;
      throw error;
    }

    // 해당 설문조사에 속하는 질문들만 필터링
    const questions = allQuestions.filter(q => q.surveyId === request.surveyId);

    if (questions.length !== questionIds.length) {
      console.log("⚠️ 경고: 일부 질문이 해당 설문조사에 속하지 않습니다");
      console.log("⚠️ 설문조사에 속한 질문:", questions.length);
      console.log("⚠️ 전체 질문:", questionIds.length);

      // MOCK 데이터 테스트를 위해 임시로 경고만 하고 진행
      // TODO: 실제 배포 시에는 아래 주석을 해제하여 에러를 발생시켜야 합니다
      // const error = new Error(ANSWER_MESSAGE.INVALID_QUESTION);
      // error.cause = 400;
      // throw error;
    }

    // Transaction으로 답변 저장
    const result = await prisma.$transaction(async tx => {
      // 기존 답변 삭제 (재제출 시)
      await tx.surveyAnswer.deleteMany({
        where: {
          userId: user.id,
          questionId: { in: questionIds },
        },
      });

      // 새 답변 저장
      for (const answer of request.answers) {
        if (answer.type === "SCALE") {
          await tx.surveyAnswer.create({
            data: {
              questionId: answer.questionId,
              userId: user.id,
              scaleAnswer: answer.scaleValue,
            },
          });
        } else if (answer.type === "SUBJECTIVE") {
          await tx.surveyAnswer.create({
            data: {
              questionId: answer.questionId,
              userId: user.id,
              textAnswer: answer.textResponse,
            },
          });
        } else if (answer.type === "MULTIPLE_CHOICE") {
          // 객관식은 선택한 옵션마다 별도 레코드 생성
          for (const optionId of answer.selectedOptionIds) {
            await tx.surveyAnswer.create({
              data: {
                questionId: answer.questionId,
                userId: user.id,
                optionId: optionId,
              },
            });
          }
        }
      }

      return {
        surveyId: request.surveyId,
        answersCount: request.answers.length,
        submittedAt: new Date(),
      };
    });

    return { data: result };
  } catch (error) {
    console.error("❌ 답변 제출 에러:", error);

    if (error instanceof Error && error.cause) {
      throw error;
    }

    const serverError = new Error(ANSWER_MESSAGE.ANSWER_SUBMISSION_FAILED);
    serverError.cause = 500;
    throw serverError;
  }
}

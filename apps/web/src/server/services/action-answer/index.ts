import {
  actionAnswerInputSchema,
  actionAnswerUpdateSchema,
  submitAnswersSchema,
} from "@/schemas/action-answer";
import { actionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { ActionType } from "@prisma/client";
import type { CreateAnswerInput, SubmitAnswersInput, UpdateAnswerInput } from "./types";

export class ActionAnswerService {
  constructor(
    private answerRepo = actionAnswerRepository,
    private responseRepo = missionResponseRepository,
    private actionRepo = actionRepository,
  ) {}

  async getAnswerById(answerId: string, userId: string) {
    const answer = await this.answerRepo.findById(answerId);

    if (!answer) {
      const error = new Error("답변을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (answer.response.userId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return answer;
  }

  async getAnswersByResponseId(responseId: string, userId: string) {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return this.answerRepo.findByResponseId(responseId);
  }

  async getAnswersByUserId(userId: string) {
    return this.answerRepo.findByUserId(userId);
  }

  async createAnswer(input: CreateAnswerInput, userId: string) {
    const parseResult = actionAnswerInputSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const { responseId, actionId, optionId, textAnswer, scaleAnswer } = parseResult.data;

    await this.verifyResponseOwnership(responseId, userId);

    const action = await this.actionRepo.findById(actionId);
    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    this.validateAnswerByActionType({ optionId, textAnswer, scaleAnswer }, action.type);

    return this.answerRepo.create({
      responseId,
      actionId,
      optionId,
      textAnswer,
      scaleAnswer,
    });
  }

  async submitAnswers(input: SubmitAnswersInput, userId: string) {
    const parseResult = submitAnswersSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const response = await this.responseRepo.findById(parseResult.data.responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("제출 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (response.completedAt) {
      const error = new Error("이미 완료된 응답입니다.");
      error.cause = 400;
      throw error;
    }

    const actionIds = parseResult.data.answers.map(a => a.actionId);
    const actions = await Promise.all(actionIds.map(id => this.actionRepo.findById(id)));

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (!action) {
        const error = new Error("일부 액션을 찾을 수 없습니다.");
        error.cause = 400;
        throw error;
      }

      if (action.missionId !== response.missionId) {
        const error = new Error("유효하지 않은 액션이 포함되어 있습니다.");
        error.cause = 400;
        throw error;
      }

      const answer = parseResult.data.answers[i];
      if (!answer) continue;

      if (answer.type !== action.type) {
        const error = new Error("답변 타입이 액션 타입과 일치하지 않습니다.");
        error.cause = 400;
        throw error;
      }
    }

    await this.answerRepo.deleteByResponseAndActions(parseResult.data.responseId, actionIds);

    const answersToCreate: Array<Parameters<typeof this.answerRepo.createMany>[0][number]> = [];

    for (const answer of parseResult.data.answers) {
      const actionId = answer.actionId;

      if (answer.type === ActionType.MULTIPLE_CHOICE && answer.selectedOptionIds) {
        for (const optionId of answer.selectedOptionIds) {
          answersToCreate.push({
            responseId: parseResult.data.responseId,
            actionId,
            optionId,
          });
        }
      } else if (answer.type === ActionType.SCALE && answer.scaleValue !== undefined) {
        answersToCreate.push({
          responseId: parseResult.data.responseId,
          actionId,
          scaleAnswer: answer.scaleValue,
        });
      } else if (answer.type === ActionType.RATING && answer.scaleValue !== undefined) {
        answersToCreate.push({
          responseId: parseResult.data.responseId,
          actionId,
          scaleAnswer: answer.scaleValue,
        });
      } else if (answer.type === ActionType.SUBJECTIVE && answer.textAnswer) {
        answersToCreate.push({
          responseId: parseResult.data.responseId,
          actionId,
          textAnswer: answer.textAnswer,
        });
      } else if (
        answer.type === ActionType.IMAGE &&
        answer.fileUploadIds &&
        answer.fileUploadIds.length > 0
      ) {
        answersToCreate.push({
          responseId: parseResult.data.responseId,
          actionId,
          fileUploads: {
            connect: answer.fileUploadIds.map(id => ({ id })),
          },
        });
      } else if (answer.type === ActionType.TAG && answer.selectedOptionIds) {
        for (const optionId of answer.selectedOptionIds) {
          answersToCreate.push({
            responseId: parseResult.data.responseId,
            actionId,
            optionId,
          });
        }
      }
    }

    await this.answerRepo.createMany(answersToCreate, userId);

    return {
      responseId: parseResult.data.responseId,
      answersCount: parseResult.data.answers.length,
      submittedAt: new Date(),
    };
  }

  async updateAnswer(answerId: string, input: UpdateAnswerInput, userId: string) {
    const parseResult = actionAnswerUpdateSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const answer = await this.getAnswerById(answerId, userId);

    const action = await this.actionRepo.findById(answer.actionId);
    if (action) {
      this.validateAnswerByActionType(parseResult.data, action.type);
    }

    return this.answerRepo.update(answerId, parseResult.data);
  }

  async deleteAnswer(answerId: string, userId: string): Promise<void> {
    await this.getAnswerById(answerId, userId);
    await this.answerRepo.delete(answerId);
  }

  async deleteAnswersByResponseId(responseId: string, userId: string): Promise<void> {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.answerRepo.deleteByResponseId(responseId);
  }

  private async verifyResponseOwnership(responseId: string, userId: string): Promise<void> {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("권한이 없습니다.");
      error.cause = 403;
      throw error;
    }
  }

  private validateAnswerByActionType(
    data: { optionId?: string; textAnswer?: string; scaleAnswer?: number },
    actionType: ActionType,
  ) {
    if (actionType === ActionType.MULTIPLE_CHOICE && !data.optionId) {
      const error = new Error("객관식 답변에는 선택지가 필요합니다.");
      error.cause = 400;
      throw error;
    }
    if (actionType === ActionType.SCALE && data.scaleAnswer === undefined) {
      const error = new Error("척도 값을 선택해주세요.");
      error.cause = 400;
      throw error;
    }
    if (actionType === ActionType.RATING && data.scaleAnswer === undefined) {
      const error = new Error("별점 값을 선택해주세요.");
      error.cause = 400;
      throw error;
    }
    if (actionType === ActionType.SUBJECTIVE && !data.textAnswer) {
      const error = new Error("주관식 답변은 필수입니다.");
      error.cause = 400;
      throw error;
    }
  }
}

export const actionAnswerService = new ActionAnswerService();

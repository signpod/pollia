import {
  actionAnswerUpdateSchema,
  baseAnswerInputSchema,
  dateAnswerInputSchema,
  imageAnswerInputSchema,
  multipleChoiceAnswerInputSchema,
  pdfAnswerInputSchema,
  ratingAnswerInputSchema,
  scaleAnswerInputSchema,
  shortTextAnswerInputSchema,
  subjectiveAnswerInputSchema,
  submitAnswersSchema,
  tagAnswerInputSchema,
  timeAnswerInputSchema,
  videoAnswerInputSchema,
} from "@/schemas/action-answer";
import { actionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { ActionType } from "@prisma/client";
import { z } from "zod";
import type { SubmitAnswersInput, UpdateAnswerInput } from "./types";

export class ActionAnswerService {
  constructor(
    private answerRepo = actionAnswerRepository,
    private responseRepo = missionResponseRepository,
    private actionRepo = actionRepository,
  ) {}

  async getAnswerById(answerId: string, userId: string) {
    const answer = await this.answerRepo.findById(answerId);

    if (!answer) {
      this.throwError("답변을 찾을 수 없습니다.", 404);
    }

    if (answer.response.userId !== userId) {
      this.throwError("조회 권한이 없습니다.", 403);
    }

    return answer;
  }

  async getAnswersByResponseId(responseId: string, userId: string) {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      this.throwError("응답을 찾을 수 없습니다.", 404);
    }

    if (response.userId !== userId) {
      this.throwError("조회 권한이 없습니다.", 403);
    }

    return this.answerRepo.findByResponseId(responseId);
  }

  async getAnswersByUserId(userId: string) {
    return this.answerRepo.findByUserId(userId);
  }

  async submitAnswers(input: SubmitAnswersInput, userId: string) {
    const validated = this.validateInput(input, submitAnswersSchema);

    const response = await this.verifyResponseOwnership(validated.responseId, userId, {
      checkCompleted: true,
    });

    const actionIds = validated.answers.map(a => a.actionId);
    const actions = await Promise.all(actionIds.map(id => this.actionRepo.findById(id)));

    this.validateActions(actions, validated.answers, response.missionId);

    for (const answer of validated.answers) {
      const action = actions.find(a => a?.id === answer.actionId);
      if (action) {
        this.validateAnswerByActionType(
          {
            responseId: validated.responseId,
            actionId: answer.actionId,
            optionId: answer.selectedOptionIds?.[0],
            textAnswer: answer.textAnswer,
            scaleAnswer: answer.scaleValue,
            dateAnswers: answer.dateAnswers,
            fileUploadIds: answer.fileUploadIds,
          },
          action.type,
          action.isRequired,
        );
      }
    }

    await this.answerRepo.deleteByResponseAndActions(validated.responseId, actionIds);

    const answersToCreate = validated.answers.flatMap(answer =>
      this.convertAnswerToCreateInput(answer, validated.responseId),
    );

    await this.answerRepo.createMany(answersToCreate, userId);

    return {
      responseId: validated.responseId,
      answersCount: validated.answers.length,
      submittedAt: new Date(),
    };
  }

  async updateAnswer(answerId: string, input: UpdateAnswerInput, userId: string) {
    const validated = this.validateInput(input, actionAnswerUpdateSchema);

    const answer = await this.getAnswerById(answerId, userId);

    const action = await this.actionRepo.findById(answer.actionId);
    if (action) {
      this.validateAnswerByActionType(
        {
          responseId: answer.responseId,
          actionId: answer.actionId,
          ...validated,
        },
        action.type,
        action.isRequired,
      );
    }

    return this.answerRepo.update(answerId, validated);
  }

  async deleteAnswer(answerId: string, userId: string): Promise<void> {
    await this.getAnswerById(answerId, userId);
    await this.answerRepo.delete(answerId);
  }

  async deleteAnswersByResponseId(responseId: string, userId: string): Promise<void> {
    await this.verifyResponseOwnership(responseId, userId);
    await this.answerRepo.deleteByResponseId(responseId);
  }

  private async verifyResponseOwnership(
    responseId: string,
    userId: string,
    options?: { checkCompleted?: boolean },
  ) {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      this.throwError("응답을 찾을 수 없습니다.", 404);
    }

    if (response.userId !== userId) {
      this.throwError("권한이 없습니다.", 403);
    }

    if (options?.checkCompleted && response.completedAt) {
      this.throwError("이미 완료된 응답입니다.", 400);
    }

    return response;
  }

  private throwError(message: string, statusCode: number): never {
    const error = new Error(message);
    error.cause = statusCode;
    throw error;
  }

  private validateInput<T>(input: unknown, schema: z.ZodType<T>): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      this.throwError(result.error.issues[0]?.message || "유효성 검사 실패", 400);
    }
    return result.data;
  }

  private throwValidationError(message: string): never {
    this.throwError(message, 400);
  }

  private validateActions(
    actions: Awaited<ReturnType<typeof this.actionRepo.findById>>[],
    answers: SubmitAnswersInput["answers"],
    missionId: string,
  ): void {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (!action) {
        this.throwError("일부 액션을 찾을 수 없습니다.", 400);
      }

      if (action.missionId !== missionId) {
        this.throwError("유효하지 않은 액션이 포함되어 있습니다.", 400);
      }

      const answer = answers[i];
      if (!answer) {
        continue;
      }

      if (answer.type !== action.type) {
        this.throwError("답변 타입이 액션 타입과 일치하지 않습니다.", 400);
      }

      if (answer.isRequired !== action.isRequired) {
        this.throwError("답변의 필수 여부가 액션과 일치하지 않습니다.", 400);
      }

      if (action.isRequired && this.isEmptyAnswer(answer)) {
        this.throwError(`필수 답변이 누락되었습니다. (액션: ${action.title})`, 400);
      }
    }
  }

  private convertAnswerToCreateInput(
    answer: SubmitAnswersInput["answers"][number],
    responseId: string,
  ): Array<Parameters<typeof this.answerRepo.createMany>[0][number]> {
    const baseData = { responseId, actionId: answer.actionId };

    switch (answer.type) {
      case ActionType.MULTIPLE_CHOICE:
      case ActionType.TAG: {
        const multipleChoiceAnswers = [];

        // Add option-based answers
        if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
          multipleChoiceAnswers.push(
            ...answer.selectedOptionIds.map(optionId => ({
              ...baseData,
              optionId,
            })),
          );
        }

        // Add "기타" text answer if provided
        if (answer.textAnswer) {
          multipleChoiceAnswers.push({ ...baseData, textAnswer: answer.textAnswer });
        }

        return multipleChoiceAnswers.length > 0 ? multipleChoiceAnswers : [baseData];
      }

      case ActionType.SCALE:
      case ActionType.RATING:
        return answer.scaleValue !== undefined
          ? [{ ...baseData, scaleAnswer: answer.scaleValue }]
          : [baseData];

      case ActionType.SUBJECTIVE:
      case ActionType.SHORT_TEXT:
        return answer.textAnswer ? [{ ...baseData, textAnswer: answer.textAnswer }] : [baseData];

      case ActionType.IMAGE:
      case ActionType.PDF:
      case ActionType.VIDEO:
        return answer.fileUploadIds && answer.fileUploadIds.length > 0
          ? [
              {
                ...baseData,
                fileUploads: {
                  connect: answer.fileUploadIds.map(id => ({ id })),
                },
              },
            ]
          : [baseData];

      case ActionType.DATE:
      case ActionType.TIME:
        return answer.dateAnswers && answer.dateAnswers.length > 0
          ? [{ ...baseData, dateAnswers: answer.dateAnswers }]
          : [baseData];

      default:
        return [baseData];
    }
  }

  private isEmptyAnswer(answer: SubmitAnswersInput["answers"][number]): boolean {
    switch (answer.type) {
      case ActionType.MULTIPLE_CHOICE:
      case ActionType.TAG:
        return (
          (!answer.selectedOptionIds || answer.selectedOptionIds.length === 0) && !answer.textAnswer
        );

      case ActionType.SCALE:
      case ActionType.RATING:
        return answer.scaleValue === undefined;

      case ActionType.SUBJECTIVE:
      case ActionType.SHORT_TEXT:
        return !answer.textAnswer;

      case ActionType.IMAGE:
      case ActionType.PDF:
      case ActionType.VIDEO:
        return !answer.fileUploadIds || answer.fileUploadIds.length === 0;

      case ActionType.DATE:
      case ActionType.TIME:
        return !answer.dateAnswers || answer.dateAnswers.length === 0;

      default:
        return true;
    }
  }

  private getSchemaByActionType(actionType: ActionType): z.ZodType {
    switch (actionType) {
      case ActionType.SUBJECTIVE:
        return subjectiveAnswerInputSchema;
      case ActionType.SHORT_TEXT:
        return shortTextAnswerInputSchema;
      case ActionType.SCALE:
        return scaleAnswerInputSchema;
      case ActionType.RATING:
        return ratingAnswerInputSchema;
      case ActionType.MULTIPLE_CHOICE:
        return multipleChoiceAnswerInputSchema;
      case ActionType.TAG:
        return tagAnswerInputSchema;
      case ActionType.IMAGE:
        return imageAnswerInputSchema;
      case ActionType.PDF:
        return pdfAnswerInputSchema;
      case ActionType.VIDEO:
        return videoAnswerInputSchema;
      case ActionType.DATE:
        return dateAnswerInputSchema;
      case ActionType.TIME:
        return timeAnswerInputSchema;
      default:
        return baseAnswerInputSchema;
    }
  }

  private validateAnswerByActionType(
    input: {
      responseId: string;
      actionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
      dateAnswers?: Date[];
      fileUploadIds?: string[];
    },
    actionType: ActionType,
    isRequired: boolean,
  ) {
    if (!isRequired) {
      return this.validateInput(input, baseAnswerInputSchema);
    }

    const schema = this.getSchemaByActionType(actionType);
    return this.validateInput(input, schema);
  }
}

export const actionAnswerService = new ActionAnswerService();

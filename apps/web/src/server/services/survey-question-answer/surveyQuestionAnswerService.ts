import {
  questionAnswerInputSchema,
  questionAnswerUpdateSchema,
  submitAnswersSchema,
} from "@/schemas/survey-question-answer";
import { surveyQuestionAnswerRepository } from "@/server/repositories/survey-question-answer/surveyQuestionAnswerRepository";
import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyResponseRepository } from "@/server/repositories/survey-response/surveyResponseRepository";
import { SurveyQuestionType } from "@prisma/client";
import type { CreateAnswerInput, SubmitAnswersInput, UpdateAnswerInput } from "./types";

export class SurveyQuestionAnswerService {
  constructor(
    private answerRepo = surveyQuestionAnswerRepository,
    private responseRepo = surveyResponseRepository,
    private questionRepo = surveyQuestionRepository,
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
    const parseResult = questionAnswerInputSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const { responseId, questionId, optionId, textAnswer, scaleAnswer } = parseResult.data;

    await this.verifyResponseOwnership(responseId, userId);

    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    this.validateAnswerByQuestionType({ optionId, textAnswer, scaleAnswer }, question.type);

    return this.answerRepo.create({
      responseId,
      questionId,
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

    const questionIds = parseResult.data.answers.map(a => a.questionId);
    const questions = await Promise.all(questionIds.map(id => this.questionRepo.findById(id)));

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question) {
        const error = new Error("일부 질문을 찾을 수 없습니다.");
        error.cause = 400;
        throw error;
      }

      if (question.surveyId !== response.surveyId) {
        const error = new Error("유효하지 않은 질문이 포함되어 있습니다.");
        error.cause = 400;
        throw error;
      }

      const answer = parseResult.data.answers[i];
      if (!answer) continue;

      if (answer.type !== question.type) {
        const error = new Error("답변 타입이 질문 타입과 일치하지 않습니다.");
        error.cause = 400;
        throw error;
      }
    }

    await this.answerRepo.deleteByResponseAndQuestions(parseResult.data.responseId, questionIds);

    const answersToCreate: Array<{
      responseId: string;
      questionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    }> = [];

    for (const answer of parseResult.data.answers) {
      if (answer.type === SurveyQuestionType.MULTIPLE_CHOICE && answer.selectedOptionIds) {
        for (const optionId of answer.selectedOptionIds) {
          answersToCreate.push({
            responseId: parseResult.data.responseId,
            questionId: answer.questionId,
            optionId,
          });
        }
      } else if (answer.type === SurveyQuestionType.SCALE && answer.scaleValue !== undefined) {
        answersToCreate.push({
          responseId: parseResult.data.responseId,
          questionId: answer.questionId,
          scaleAnswer: answer.scaleValue,
        });
      } else if (answer.type === SurveyQuestionType.SUBJECTIVE && answer.textResponse) {
        answersToCreate.push({
          responseId: parseResult.data.responseId,
          questionId: answer.questionId,
          textAnswer: answer.textResponse,
        });
      }
    }

    await this.answerRepo.createMany(answersToCreate);

    return {
      responseId: parseResult.data.responseId,
      answersCount: parseResult.data.answers.length,
      submittedAt: new Date(),
    };
  }

  async updateAnswer(answerId: string, input: UpdateAnswerInput, userId: string) {
    const parseResult = questionAnswerUpdateSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const answer = await this.getAnswerById(answerId, userId);

    const question = await this.questionRepo.findById(answer.questionId);
    if (question) {
      this.validateAnswerByQuestionType(parseResult.data, question.type);
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

  private validateAnswerByQuestionType(
    data: { optionId?: string; textAnswer?: string; scaleAnswer?: number },
    questionType: SurveyQuestionType,
  ) {
    if (questionType === SurveyQuestionType.MULTIPLE_CHOICE && !data.optionId) {
      const error = new Error("객관식 답변에는 선택지가 필요합니다.");
      error.cause = 400;
      throw error;
    }
    if (questionType === SurveyQuestionType.SCALE && data.scaleAnswer === undefined) {
      const error = new Error("척도 값을 선택해주세요.");
      error.cause = 400;
      throw error;
    }
    if (questionType === SurveyQuestionType.SUBJECTIVE && !data.textAnswer) {
      const error = new Error("주관식 답변은 필수입니다.");
      error.cause = 400;
      throw error;
    }
  }
}

export const surveyQuestionAnswerService = new SurveyQuestionAnswerService();

import { completeResponseInputSchema, startResponseInputSchema } from "@/schemas/survey-response";
import { surveyResponseRepository } from "@/server/repositories/survey-response/surveyResponseRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type { CompleteResponseInput, ResponseStats, StartResponseInput } from "./types";

export class SurveyResponseService {
  constructor(
    private responseRepo = surveyResponseRepository,
    private surveyRepo = surveyRepository,
  ) {}

  async getResponseById(responseId: string, userId: string) {
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

    return response;
  }

  async getResponseBySurveyAndUser(surveyId: string, userId: string) {
    return this.responseRepo.findBySurveyAndUser(surveyId, userId);
  }

  async getUserResponses(userId: string) {
    return this.responseRepo.findByUserId(userId);
  }

  async getSurveyResponses(surveyId: string, userId: string) {
    const survey = await this.surveyRepo.findById(surveyId);

    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (survey.creatorId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return this.responseRepo.findBySurveyId(surveyId);
  }

  async getSurveyStats(surveyId: string, userId: string): Promise<ResponseStats> {
    const survey = await this.surveyRepo.findById(surveyId);

    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (survey.creatorId !== userId) {
      const error = new Error("조회 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const total = await this.responseRepo.countBySurveyId(surveyId);
    const completed = await this.responseRepo.countCompletedBySurveyId(surveyId);

    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  async startResponse(input: StartResponseInput, userId: string) {
    const parseResult = startResponseInputSchema.safeParse(input);
    if (!parseResult.success) {
      const error = new Error(parseResult.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const survey = await this.surveyRepo.findById(parseResult.data.surveyId);

    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (!survey.isActive) {
      const error = new Error("종료된 설문조사입니다.");
      error.cause = 400;
      throw error;
    }

    const existingResponse = await this.responseRepo.findBySurveyAndUser(
      parseResult.data.surveyId,
      userId,
    );
    if (existingResponse) {
      return existingResponse;
    }

    return this.responseRepo.create({
      surveyId: parseResult.data.surveyId,
      userId,
    });
  }

  async completeResponse(input: CompleteResponseInput, userId: string) {
    const parseResult = completeResponseInputSchema.safeParse(input);
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
      const error = new Error("완료 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (response.completedAt) {
      const error = new Error("이미 완료된 응답입니다.");
      error.cause = 400;
      throw error;
    }

    return this.responseRepo.updateCompletedAt(parseResult.data.responseId);
  }

  async deleteResponse(responseId: string, userId: string): Promise<void> {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (response.userId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.responseRepo.delete(responseId);
  }

  async verifyResponseOwnership(responseId: string, userId: string): Promise<boolean> {
    const response = await this.responseRepo.findById(responseId);

    if (!response) {
      const error = new Error("응답을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return response.userId === userId;
  }
}

export const surveyResponseService = new SurveyResponseService();

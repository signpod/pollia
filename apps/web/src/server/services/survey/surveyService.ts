import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type {
  CreateSurveyInput,
  GetUserSurveysOptions,
  SurveyCreatedResult,
  UpdateSurveyInput,
} from "./types";

export class SurveyService {
  constructor(private repo = surveyRepository) {}

  async getSurvey(surveyId: string) {
    const survey = await this.repo.findById(surveyId);

    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return survey;
  }

  async getSurveyQuestionIds(surveyId: string) {
    await this.getSurvey(surveyId);
    const questionIds = await this.repo.findQuestionIdsBySurveyId(surveyId);
    return { questionIds };
  }

  async getQuestionById(questionId: string) {
    const question = await this.repo.findQuestionById(questionId);

    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return question;
  }

  async getSurveyQuestionsDetail(surveyId: string) {
    await this.getSurvey(surveyId);
    const questions = await this.repo.findQuestionsBySurveyId(surveyId);
    return questions;
  }

  async getUserSurveys(userId: string, options?: GetUserSurveysOptions) {
    const limit = options?.limit ?? 10;
    const surveys = await this.repo.findByUserId(userId, {
      ...options,
      limit,
    });

    if (surveys.length > limit) {
      surveys.pop();
    }

    return surveys;
  }

  async createSurvey(input: CreateSurveyInput, userId: string): Promise<SurveyCreatedResult> {
    if (!input.title || input.title.trim().length === 0) {
      const error = new Error("제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (input.questionIds.length === 0) {
      const error = new Error("최소 1개 이상의 질문이 필요합니다.");
      error.cause = 400;
      throw error;
    }

    const survey = await this.repo.createWithQuestions(
      {
        title: input.title,
        description: input.description ?? undefined,
        target: input.target ?? undefined,
        imageUrl: input.imageUrl ?? undefined,
        deadline: input.deadline ?? undefined,
        estimatedMinutes: input.estimatedMinutes ?? undefined,
        creatorId: userId,
      },
      input.questionIds,
    );

    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      target: survey.target,
      imageUrl: survey.imageUrl,
      deadline: survey.deadline,
      estimatedMinutes: survey.estimatedMinutes,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      creatorId: userId,
    };
  }

  async updateSurvey(surveyId: string, data: UpdateSurveyInput, userId: string) {
    const survey = await this.getSurvey(surveyId);

    if (survey.creatorId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      const error = new Error("제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    const updatedSurvey = await this.repo.update(surveyId, data);
    return updatedSurvey;
  }

  async deleteSurvey(surveyId: string, userId: string): Promise<void> {
    const survey = await this.getSurvey(surveyId);

    if (survey.creatorId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.delete(surveyId);
  }
}

export const surveyService = new SurveyService();

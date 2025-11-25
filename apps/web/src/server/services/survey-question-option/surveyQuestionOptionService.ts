import {
  optionInputSchema,
  optionUpdateSchema,
  optionsInputSchema,
} from "@/schemas/survey-question-option";
import { surveyQuestionOptionRepository } from "@/server/repositories/survey-question-option/surveyQuestionOptionRepository";
import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type { SurveyQuestionOption } from "@prisma/client";

export class SurveyQuestionOptionService {
  constructor(
    private optionRepo = surveyQuestionOptionRepository,
    private questionRepo = surveyQuestionRepository,
    private surveyRepo = surveyRepository,
  ) {}

  async getOptionById(optionId: string): Promise<SurveyQuestionOption> {
    const option = await this.optionRepo.findById(optionId);

    if (!option) {
      const error = new Error("옵션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return option;
  }

  async getOptionsByQuestionId(questionId: string): Promise<SurveyQuestionOption[]> {
    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const options = await this.optionRepo.findByQuestionId(questionId);
    return options;
  }

  async createOption(
    data: {
      questionId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      fileUploadId?: string;
    },
    userId: string,
  ): Promise<SurveyQuestionOption> {
    const result = optionInputSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    await this.verifyQuestionAccess(result.data.questionId, userId);

    const option = await this.optionRepo.create(result.data, userId);
    return option;
  }

  async createOptions(
    questionId: string,
    options: Array<{
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      fileUploadId?: string;
    }>,
    userId: string,
  ): Promise<SurveyQuestionOption[]> {
    const result = optionsInputSchema.safeParse({ questionId, options });
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    await this.verifyQuestionAccess(result.data.questionId, userId);

    const createdOptions = await this.optionRepo.createMany(
      result.data.questionId,
      result.data.options,
      userId,
    );
    return createdOptions;
  }

  async updateOption(
    optionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
    },
    userId: string,
  ): Promise<SurveyQuestionOption> {
    const result = optionUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const option = await this.getOptionById(optionId);

    await this.verifyQuestionAccess(option.questionId, userId);

    const updatedOption = await this.optionRepo.update(optionId, result.data);
    return updatedOption;
  }

  async deleteOption(optionId: string, userId: string): Promise<void> {
    const option = await this.getOptionById(optionId);

    await this.verifyQuestionAccess(option.questionId, userId);

    await this.optionRepo.delete(optionId);
  }

  async deleteOptionsByQuestionId(questionId: string, userId: string): Promise<void> {
    await this.verifyQuestionAccess(questionId, userId);

    await this.optionRepo.deleteByQuestionId(questionId);
  }

  private async verifyQuestionAccess(questionId: string, userId: string): Promise<void> {
    const question = await this.questionRepo.findById(questionId);

    if (!question) {
      const error = new Error("존재하지 않는 질문입니다.");
      error.cause = 404;
      throw error;
    }

    if (question.surveyId) {
      const survey = await this.surveyRepo.findById(question.surveyId);

      if (!survey) {
        const error = new Error("존재하지 않는 설문조사입니다.");
        error.cause = 404;
        throw error;
      }

      if (survey.creatorId !== userId) {
        const error = new Error("옵션을 수정할 권한이 없습니다.");
        error.cause = 403;
        throw error;
      }
    }
  }
}

export const surveyQuestionOptionService = new SurveyQuestionOptionService();

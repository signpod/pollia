import { multipleChoiceInfoSchema } from "@/schemas/survey/question/creation/multipleChoiceInfoSchema";
import { scaleInfoSchema } from "@/schemas/survey/question/creation/scaleInfoSchema";
import { subjectiveInfoSchema } from "@/schemas/survey/question/creation/subjectiveInfoSchema";
import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyQuestionType } from "@prisma/client";
import type {
  CreateEitherOrInput,
  CreateMultipleChoiceInput,
  CreateScaleInput,
  CreateSubjectiveInput,
  GetQuestionsOptions,
  QuestionCreatedResult,
  UpdateQuestionInput,
} from "./types";

export class SurveyQuestionService {
  constructor(
    private questionRepo = surveyQuestionRepository,
    private surveyRepo = surveyRepository,
  ) {}

  async getQuestionById(questionId: string) {
    const question = await this.questionRepo.findByIdWithOptions(questionId);

    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return question;
  }

  async getSurveyQuestionIds(surveyId: string) {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const questionIds = await this.questionRepo.findQuestionIdsBySurveyId(surveyId);

    return { questionIds };
  }

  async getSurveyQuestionsDetail(surveyId: string) {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const questions = await this.questionRepo.findDetailsBySurveyId(surveyId);

    return questions;
  }

  async getQuestions(options?: GetQuestionsOptions) {
    const limit = options?.limit ?? 10;
    const questions = await this.questionRepo.findMany({
      ...options,
      limit,
    });

    if (questions.length > limit) {
      questions.pop();
    }

    return questions;
  }

  async createMultipleChoiceQuestion(
    input: CreateMultipleChoiceInput,
    userId: string,
  ): Promise<QuestionCreatedResult> {
    const validationError = this.validateMultipleChoiceQuestion(input);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (input.surveyId) {
      await this.verifySurveyAccess(input.surveyId, userId);
    }

    const question = await this.questionRepo.createMultipleChoice(
      {
        surveyId: input.surveyId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: input.order,
        maxSelections: input.maxSelections,
      },
      input.options,
      userId,
    );

    return {
      id: question.id,
      surveyId: question.surveyId || "",
      title: question.title,
      type: question.type,
      order: question.order,
      createdAt: question.createdAt,
    };
  }

  async createScaleQuestion(
    input: CreateScaleInput,
    userId: string,
  ): Promise<QuestionCreatedResult> {
    const validationError = this.validateScaleQuestion(input);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (input.surveyId) {
      await this.verifySurveyAccess(input.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: input.surveyId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      type: SurveyQuestionType.SCALE,
      order: input.order,
    });

    return {
      id: question.id,
      surveyId: question.surveyId || "",
      title: question.title,
      type: question.type,
      order: question.order,
      createdAt: question.createdAt,
    };
  }

  async createSubjectiveQuestion(
    input: CreateSubjectiveInput,
    userId: string,
  ): Promise<QuestionCreatedResult> {
    const validationError = this.validateSubjectiveQuestion(input);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (input.surveyId) {
      await this.verifySurveyAccess(input.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: input.surveyId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      type: SurveyQuestionType.SUBJECTIVE,
      order: input.order,
    });

    return {
      id: question.id,
      surveyId: question.surveyId || "",
      title: question.title,
      type: question.type,
      order: question.order,
      createdAt: question.createdAt,
    };
  }

  async createEitherOrQuestion(
    input: CreateEitherOrInput,
    userId: string,
  ): Promise<QuestionCreatedResult> {
    if (!input.title || input.title.trim().length === 0) {
      const error = new Error("제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (input.surveyId) {
      await this.verifySurveyAccess(input.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: input.surveyId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: input.order,
    });

    return {
      id: question.id,
      surveyId: question.surveyId || "",
      title: question.title,
      type: question.type,
      order: question.order,
      createdAt: question.createdAt,
    };
  }

  async updateQuestion(questionId: string, data: UpdateQuestionInput, userId: string) {
    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (question.surveyId) {
      await this.verifySurveyAccess(question.surveyId, userId);
    }

    const updatedQuestion = await this.questionRepo.update(questionId, data);

    return updatedQuestion;
  }

  async deleteQuestion(questionId: string, userId: string): Promise<void> {
    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (question.surveyId) {
      await this.verifySurveyAccess(question.surveyId, userId);
    }

    await this.questionRepo.delete(questionId);
  }

  private async verifySurveyAccess(surveyId: string, userId: string): Promise<void> {
    const survey = await this.surveyRepo.findById(surveyId);

    if (!survey) {
      const error = new Error("존재하지 않는 설문조사입니다.");
      error.cause = 404;
      throw error;
    }

    if (survey.creatorId !== userId) {
      const error = new Error("질문을 추가할 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }
  }

  private validateMultipleChoiceQuestion(input: CreateMultipleChoiceInput): string | null {
    try {
      const formData = {
        title: input.title,
        description: input.description || "",
        imageUrl: input.imageUrl || "",
        maxSelections: input.maxSelections,
        options: input.options.map(opt => ({
          id: `temp-${opt.order}`,
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
          fileUploadId: opt.imageFileUploadId,
        })),
      };

      const result = multipleChoiceInfoSchema.safeParse(formData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }

      return null;
    } catch {
      return "유효성 검사 중 오류가 발생했습니다.";
    }
  }

  private validateScaleQuestion(input: CreateScaleInput): string | null {
    try {
      const formData = {
        title: input.title,
        description: input.description || "",
        imageUrl: input.imageUrl || "",
      };

      const result = scaleInfoSchema.safeParse(formData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }

      return null;
    } catch {
      return "유효성 검사 중 오류가 발생했습니다.";
    }
  }

  private validateSubjectiveQuestion(input: CreateSubjectiveInput): string | null {
    try {
      const formData = {
        title: input.title,
        description: input.description || "",
        imageUrl: input.imageUrl || "",
      };

      const result = subjectiveInfoSchema.safeParse(formData);
      if (!result.success) {
        return result.error.issues[0]?.message || "유효성 검사에 실패했습니다.";
      }

      return null;
    } catch {
      return "유효성 검사 중 오류가 발생했습니다.";
    }
  }
}

export const surveyQuestionService = new SurveyQuestionService();

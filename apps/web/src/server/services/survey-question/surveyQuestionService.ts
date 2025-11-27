import {
  eitherOrInputSchema,
  multipleChoiceInputSchema,
  questionUpdateSchema,
  scaleInputSchema,
  subjectiveInputSchema,
} from "@/schemas/survey-question";
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
    const result = multipleChoiceInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.surveyId) {
      await this.verifySurveyAccess(result.data.surveyId, userId);
    }

    const question = await this.questionRepo.createMultipleChoice(
      {
        surveyId: result.data.surveyId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: result.data.order,
        maxSelections: result.data.maxSelections,
      },
      result.data.options.map(opt => ({
        title: opt.title,
        description: opt.description,
        imageUrl: opt.imageUrl,
        order: opt.order,
        imageFileUploadId: opt.imageFileUploadId,
      })),
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
    const result = scaleInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.surveyId) {
      await this.verifySurveyAccess(result.data.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: result.data.surveyId,
      title: result.data.title,
      description: result.data.description,
      imageUrl: result.data.imageUrl,
      type: SurveyQuestionType.SCALE,
      order: result.data.order,
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
    const result = subjectiveInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.surveyId) {
      await this.verifySurveyAccess(result.data.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: result.data.surveyId,
      title: result.data.title,
      description: result.data.description,
      imageUrl: result.data.imageUrl,
      type: SurveyQuestionType.SUBJECTIVE,
      order: result.data.order,
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
    const result = eitherOrInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.surveyId) {
      await this.verifySurveyAccess(result.data.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: result.data.surveyId,
      title: result.data.title,
      description: result.data.description,
      imageUrl: result.data.imageUrl,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: result.data.order,
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
    const result = questionUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (question.surveyId) {
      await this.verifySurveyAccess(question.surveyId, userId);
    }

    const updatedQuestion = await this.questionRepo.update(questionId, result.data);

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
}

export const surveyQuestionService = new SurveyQuestionService();

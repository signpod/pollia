import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import { multipleChoiceInfoSchema } from "@/schemas/survey/question/creation/multipleChoiceInfoSchema";
import { scaleInfoSchema } from "@/schemas/survey/question/creation/scaleInfoSchema";
import { subjectiveInfoSchema } from "@/schemas/survey/question/creation/subjectiveInfoSchema";
import type {
  CreateEitherOrQuestionRequest,
  CreateMultipleChoiceQuestionRequest,
  CreateScaleQuestionRequest,
  CreateSubjectiveQuestionRequest,
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyQuestionsResponse,
} from "@/types/dto";
import { SurveyQuestionType } from "@prisma/client";

/**
 * Survey Question Service
 * Survey Question 도메인의 비즈니스 로직 계층
 */
export class SurveyQuestionService {
  constructor(
    private questionRepo = surveyQuestionRepository,
    private surveyRepo = surveyRepository,
  ) {}

  /**
   * Question ID로 Question 상세 조회
   * @param questionId - Question ID
   * @returns Question 상세 정보
   * @throws 404 - Question을 찾을 수 없는 경우
   */
  async getQuestionById(questionId: string): Promise<GetQuestionByIdResponse["data"]> {
    const question = await this.questionRepo.findByIdWithOptions(questionId);

    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return question;
  }

  /**
   * Survey ID로 Question ID 목록 조회
   * @param surveyId - Survey ID
   * @returns Question ID 배열
   * @throws 404 - Survey를 찾을 수 없는 경우
   */
  async getSurveyQuestionIds(surveyId: string): Promise<GetSurveyQuestionIdsResponse["data"]> {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const questionIds = await this.questionRepo.findQuestionIdsBySurveyId(surveyId);

    return { questionIds };
  }

  /**
   * Survey ID로 Question 상세 목록 조회
   * @param surveyId - Survey ID
   * @returns Question 상세 목록
   * @throws 404 - Survey를 찾을 수 없는 경우
   */
  async getSurveyQuestionsDetail(surveyId: string): Promise<GetSurveyQuestionsDetailResponse["data"]> {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const questions = await this.questionRepo.findDetailsBySurveyId(surveyId);

    return questions;
  }

  /**
   * Question 목록 조회 (필터링 및 페이지네이션)
   * @param options - 조회 옵션
   * @returns Question 목록
   */
  async getQuestions(options?: {
    searchQuery?: string;
    selectedQuestionTypes?: SurveyQuestionType[];
    isDraft?: boolean;
    cursor?: string;
    limit?: number;
  }): Promise<GetSurveyQuestionsResponse["data"]> {
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

  /**
   * Multiple Choice Question 생성
   * @param request - Question 생성 요청 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Question 정보
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async createMultipleChoiceQuestion(
    request: CreateMultipleChoiceQuestionRequest,
    userId: string,
  ) {
    const validationError = this.validateMultipleChoiceQuestion(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (request.surveyId) {
      await this.verifySurveyAccess(request.surveyId, userId);
    }

    const question = await this.questionRepo.createMultipleChoice(
      {
        surveyId: request.surveyId,
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: request.maxSelections,
      },
      request.options,
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

  /**
   * Scale Question 생성
   * @param request - Question 생성 요청 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Question 정보
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async createScaleQuestion(request: CreateScaleQuestionRequest, userId: string) {
    const validationError = this.validateScaleQuestion(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (request.surveyId) {
      await this.verifySurveyAccess(request.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: request.surveyId,
      title: request.title,
      description: request.description,
      imageUrl: request.imageUrl,
      type: SurveyQuestionType.SCALE,
      order: request.order,
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

  /**
   * Subjective Question 생성
   * @param request - Question 생성 요청 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Question 정보
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async createSubjectiveQuestion(
    request: CreateSubjectiveQuestionRequest,
    userId: string,
  ) {
    const validationError = this.validateSubjectiveQuestion(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    if (request.surveyId) {
      await this.verifySurveyAccess(request.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: request.surveyId,
      title: request.title,
      description: request.description,
      imageUrl: request.imageUrl,
      type: SurveyQuestionType.SUBJECTIVE,
      order: request.order,
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

  /**
   * Either Or Question 생성
   * @param request - Question 생성 요청 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Question 정보
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async createEitherOrQuestion(
    request: CreateEitherOrQuestionRequest,
    userId: string,
  ) {
    if (!request.title || request.title.trim().length === 0) {
      const error = new Error("제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (request.surveyId) {
      await this.verifySurveyAccess(request.surveyId, userId);
    }

    const question = await this.questionRepo.create({
      surveyId: request.surveyId,
      title: request.title,
      description: request.description,
      imageUrl: request.imageUrl,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: request.order,
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

  /**
   * Question 수정
   * @param questionId - Question ID
   * @param data - 수정할 데이터
   * @param userId - 요청 User ID
   * @returns 수정된 Question 정보
   * @throws 404 - Question을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async updateQuestion(
    questionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
      maxSelections?: number;
    },
    userId: string,
  ) {
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

  /**
   * Question 삭제
   * @param questionId - Question ID
   * @param userId - 요청 User ID
   * @throws 404 - Question을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
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

  /**
   * Survey 존재 및 접근 권한 확인
   * @param surveyId - Survey ID
   * @param userId - User ID
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
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

  /**
   * Multiple Choice Question 유효성 검증
   * @param request - Question 생성 요청 데이터
   * @returns 검증 에러 메시지 또는 null
   */
  private validateMultipleChoiceQuestion(
    request: CreateMultipleChoiceQuestionRequest,
  ): string | null {
    try {
      const formData = {
        title: request.title,
        description: request.description || "",
        imageUrl: request.imageUrl || "",
        maxSelections: request.maxSelections,
        options: request.options.map(opt => ({
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

  /**
   * Scale Question 유효성 검증
   * @param request - Question 생성 요청 데이터
   * @returns 검증 에러 메시지 또는 null
   */
  private validateScaleQuestion(request: CreateScaleQuestionRequest): string | null {
    try {
      const formData = {
        title: request.title,
        description: request.description || "",
        imageUrl: request.imageUrl || "",
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

  /**
   * Subjective Question 유효성 검증
   * @param request - Question 생성 요청 데이터
   * @returns 검증 에러 메시지 또는 null
   */
  private validateSubjectiveQuestion(
    request: CreateSubjectiveQuestionRequest,
  ): string | null {
    try {
      const formData = {
        title: request.title,
        description: request.description || "",
        imageUrl: request.imageUrl || "",
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


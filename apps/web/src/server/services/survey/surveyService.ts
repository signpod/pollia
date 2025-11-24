import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type { SortOrderType } from "@/types/common/sort";
import type {
  CreateSurveyRequest,
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyResponse,
  GetUserSurveysResponse,
} from "@/types/dto";

/**
 * Survey Service
 * Survey 도메인의 비즈니스 로직 계층
 */
export class SurveyService {
  constructor(private repo = surveyRepository) {}

  /**
   * Survey ID로 Survey 정보 조회
   * @param surveyId - Survey ID
   * @returns Survey 정보
   * @throws 404 - Survey를 찾을 수 없는 경우
   */
  async getSurvey(surveyId: string): Promise<GetSurveyResponse["data"]> {
    const survey = await this.repo.findById(surveyId);

    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return survey;
  }

  /**
   * Survey ID로 Question ID 목록 조회
   * @param surveyId - Survey ID
   * @returns Question ID 배열
   * @throws 404 - Survey를 찾을 수 없는 경우
   */
  async getSurveyQuestionIds(surveyId: string): Promise<GetSurveyQuestionIdsResponse["data"]> {
    // Survey 존재 확인
    await this.getSurvey(surveyId);

    const questionIds = await this.repo.findQuestionIdsBySurveyId(surveyId);

    return {
      questionIds,
    };
  }

  /**
   * Question ID로 Question 상세 정보 조회
   * @param questionId - Question ID
   * @returns Question 상세 정보
   * @throws 404 - Question을 찾을 수 없는 경우
   */
  async getQuestionById(questionId: string): Promise<GetQuestionByIdResponse["data"]> {
    const question = await this.repo.findQuestionById(questionId);

    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return question;
  }

  /**
   * Survey ID로 모든 Question 상세 정보 조회
   * Repository의 최적화된 쿼리를 사용하여 단일 쿼리로 조회
   * @param surveyId - Survey ID
   * @returns Question 상세 정보 배열
   * @throws 404 - Survey를 찾을 수 없는 경우
   */
  async getSurveyQuestionsDetail(
    surveyId: string,
  ): Promise<GetSurveyQuestionsDetailResponse["data"]> {
    // Survey 존재 확인
    await this.getSurvey(surveyId);

    // Repository의 최적화된 단일 쿼리 사용 (N+1 문제 방지)
    const questions = await this.repo.findQuestionsBySurveyId(surveyId);

    return questions;
  }

  /**
   * User의 Survey 목록 조회
   * @param userId - User ID
   * @param options - 조회 옵션
   * @returns Survey 목록
   */
  async getUserSurveys(
    userId: string,
    options?: {
      cursor?: string;
      limit?: number;
      sortOrder?: SortOrderType;
    },
  ): Promise<GetUserSurveysResponse["data"]> {
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

  /**
   * Survey 생성
   * @param request - Survey 생성 요청 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Survey 정보
   * @throws 400 - 유효성 검증 실패
   */
  async createSurvey(request: CreateSurveyRequest, userId: string) {
    if (!request.title || request.title.trim().length === 0) {
      const error = new Error("제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (request.questionIds.length === 0) {
      const error = new Error("최소 1개 이상의 질문이 필요합니다.");
      error.cause = 400;
      throw error;
    }

    const survey = await this.repo.createWithQuestions(
      {
        title: request.title,
        description: request.description ?? undefined,
        target: request.target ?? undefined,
        imageUrl: request.imageUrl ?? undefined,
        deadline: request.deadline ?? undefined,
        estimatedMinutes: request.estimatedMinutes ?? undefined,
        creatorId: userId,
      },
      request.questionIds,
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

  /**
   * Survey 수정
   * @param surveyId - Survey ID
   * @param data - 수정할 데이터
   * @param userId - 요청 User ID
   * @returns 수정된 Survey 정보
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async updateSurvey(
    surveyId: string,
    data: {
      title?: string;
      description?: string;
      target?: string;
      imageUrl?: string;
      deadline?: Date;
      estimatedMinutes?: number;
    },
    userId: string,
  ) {
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

  /**
   * Survey 삭제
   * @param surveyId - Survey ID
   * @param userId - 요청 User ID
   * @throws 404 - Survey를 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
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

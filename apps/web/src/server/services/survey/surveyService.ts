import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type {
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyResponse,
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
}

export const surveyService = new SurveyService();

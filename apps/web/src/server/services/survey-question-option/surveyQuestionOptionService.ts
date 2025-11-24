import { surveyQuestionOptionRepository } from "@/server/repositories/survey-question-option/surveyQuestionOptionRepository";
import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type { SurveyQuestionOption } from "@prisma/client";

/**
 * Survey Question Option Service
 * Survey Question Option 도메인의 비즈니스 로직 계층
 */
export class SurveyQuestionOptionService {
  constructor(
    private optionRepo = surveyQuestionOptionRepository,
    private questionRepo = surveyQuestionRepository,
    private surveyRepo = surveyRepository,
  ) {}

  /**
   * Option ID로 Option 조회
   * @param optionId - Option ID
   * @returns Option 정보
   * @throws 404 - Option을 찾을 수 없는 경우
   */
  async getOptionById(optionId: string): Promise<SurveyQuestionOption> {
    const option = await this.optionRepo.findById(optionId);

    if (!option) {
      const error = new Error("옵션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return option;
  }

  /**
   * Question ID로 Option 목록 조회
   * @param questionId - Question ID
   * @returns Option 목록
   * @throws 404 - Question을 찾을 수 없는 경우
   */
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

  /**
   * Option 생성
   * @param data - 생성할 Option 데이터
   * @param userId - 생성자 User ID
   * @returns 생성된 Option 정보
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Question을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
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
    // Validation
    if (!data.title || data.title.trim().length === 0) {
      const error = new Error("옵션 제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    if (data.title.length > 100) {
      const error = new Error("옵션 제목은 100자를 초과할 수 없습니다.");
      error.cause = 400;
      throw error;
    }

    if (data.order < 0) {
      const error = new Error("옵션 순서는 0 이상이어야 합니다.");
      error.cause = 400;
      throw error;
    }

    // Question 존재 및 권한 확인
    await this.verifyQuestionAccess(data.questionId, userId);

    const option = await this.optionRepo.create(data, userId);
    return option;
  }

  /**
   * 여러 Option 생성
   * @param questionId - Question ID
   * @param options - 생성할 Option 데이터 목록
   * @param userId - 생성자 User ID
   * @returns 생성된 Option 목록
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Question을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
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
    // Validation
    if (!options || options.length === 0) {
      const error = new Error("최소 1개 이상의 옵션이 필요합니다.");
      error.cause = 400;
      throw error;
    }

    for (const option of options) {
      if (!option.title || option.title.trim().length === 0) {
        const error = new Error("옵션 제목은 필수입니다.");
        error.cause = 400;
        throw error;
      }

      if (option.title.length > 100) {
        const error = new Error("옵션 제목은 100자를 초과할 수 없습니다.");
        error.cause = 400;
        throw error;
      }

      if (option.order < 0) {
        const error = new Error("옵션 순서는 0 이상이어야 합니다.");
        error.cause = 400;
        throw error;
      }
    }

    // Question 존재 및 권한 확인
    await this.verifyQuestionAccess(questionId, userId);

    const createdOptions = await this.optionRepo.createMany(questionId, options, userId);
    return createdOptions;
  }

  /**
   * Option 수정
   * @param optionId - Option ID
   * @param data - 수정할 데이터
   * @param userId - 요청 User ID
   * @returns 수정된 Option 정보
   * @throws 400 - 유효성 검증 실패
   * @throws 404 - Option을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
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
    // Option 존재 확인
    const option = await this.getOptionById(optionId);

    // Validation
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        const error = new Error("옵션 제목은 필수입니다.");
        error.cause = 400;
        throw error;
      }

      if (data.title.length > 100) {
        const error = new Error("옵션 제목은 100자를 초과할 수 없습니다.");
        error.cause = 400;
        throw error;
      }
    }

    if (data.order !== undefined && data.order < 0) {
      const error = new Error("옵션 순서는 0 이상이어야 합니다.");
      error.cause = 400;
      throw error;
    }

    // Question 존재 및 권한 확인
    await this.verifyQuestionAccess(option.questionId, userId);

    const updatedOption = await this.optionRepo.update(optionId, data);
    return updatedOption;
  }

  /**
   * Option 삭제
   * @param optionId - Option ID
   * @param userId - 요청 User ID
   * @throws 404 - Option을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async deleteOption(optionId: string, userId: string): Promise<void> {
    const option = await this.getOptionById(optionId);

    // Question 존재 및 권한 확인
    await this.verifyQuestionAccess(option.questionId, userId);

    await this.optionRepo.delete(optionId);
  }

  /**
   * Question의 모든 Option 삭제
   * @param questionId - Question ID
   * @param userId - 요청 User ID
   * @throws 404 - Question을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  async deleteOptionsByQuestionId(questionId: string, userId: string): Promise<void> {
    // Question 존재 및 권한 확인
    await this.verifyQuestionAccess(questionId, userId);

    await this.optionRepo.deleteByQuestionId(questionId);
  }

  /**
   * Question 존재 및 접근 권한 확인
   * @param questionId - Question ID
   * @param userId - User ID
   * @throws 404 - Question을 찾을 수 없는 경우
   * @throws 403 - 권한이 없는 경우
   */
  private async verifyQuestionAccess(questionId: string, userId: string): Promise<void> {
    const question = await this.questionRepo.findById(questionId);

    if (!question) {
      const error = new Error("존재하지 않는 질문입니다.");
      error.cause = 404;
      throw error;
    }

    // Question이 Survey에 속한 경우 Survey 소유자 확인
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
    // Question이 Draft인 경우 추가 권한 확인 로직 필요 시 구현
  }
}

export const surveyQuestionOptionService = new SurveyQuestionOptionService();


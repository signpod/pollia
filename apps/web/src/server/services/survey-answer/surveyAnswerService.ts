import { surveyAnswerRepository } from "@/server/repositories/survey-answer/surveyAnswerRepository";
import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type { CreateAnswerRequest, SubmitAnswersRequest } from "./types";

export class SurveyAnswerService {
  constructor(
    private answerRepo = surveyAnswerRepository,
    private surveyRepo = surveyRepository,
    private questionRepo = surveyQuestionRepository,
  ) {}

  async getAnswerById(answerId: string) {
    const answer = await this.answerRepo.findById(answerId);

    if (!answer) {
      const error = new Error("답변을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return answer;
  }

  async getAnswersByQuestionAndUser(questionId: string, userId: string) {
    const question = await this.questionRepo.findById(questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return this.answerRepo.findByQuestionAndUser(questionId, userId);
  }

  async getAnswersBySurveyAndUser(surveyId: string, userId: string) {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return this.answerRepo.findBySurveyAndUser(surveyId, userId);
  }

  async getUserAnswers(userId: string) {
    return this.answerRepo.findByUserId(userId);
  }

  async createAnswer(request: CreateAnswerRequest, userId: string) {
    const question = await this.questionRepo.findById(request.questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    this.validateAnswerData(request, question.type);

    return this.answerRepo.create({
      questionId: request.questionId,
      userId,
      optionId: request.optionId,
      textAnswer: request.textAnswer,
      scaleAnswer: request.scaleAnswer,
    });
  }

  async submitAnswers(request: SubmitAnswersRequest, userId: string) {
    const survey = await this.surveyRepo.findById(request.surveyId);
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

    if (request.answers.length === 0) {
      const error = new Error("최소 1개 이상의 답변이 필요합니다.");
      error.cause = 400;
      throw error;
    }

    const questionIds = request.answers.map(a => a.questionId);
    const questions = await Promise.all(questionIds.map(id => this.questionRepo.findById(id)));

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question) {
        const error = new Error("일부 질문을 찾을 수 없습니다.");
        error.cause = 400;
        throw error;
      }

      if (question.surveyId !== request.surveyId) {
        const error = new Error("유효하지 않은 질문이 포함되어 있습니다.");
        error.cause = 400;
        throw error;
      }

      const answer = request.answers[i];
      if (!answer) continue;
      this.validateSubmitAnswer(answer, question.type);
    }

    await this.answerRepo.deleteByQuestionsAndUser(questionIds, userId);

    const answersToCreate: Array<{
      questionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    }> = [];

    for (const answer of request.answers) {
      if (answer.type === "MULTIPLE_CHOICE" && answer.selectedOptionIds) {
        for (const optionId of answer.selectedOptionIds) {
          answersToCreate.push({
            questionId: answer.questionId,
            optionId,
          });
        }
      } else if (answer.type === "SCALE" && answer.scaleValue !== undefined) {
        answersToCreate.push({
          questionId: answer.questionId,
          scaleAnswer: answer.scaleValue,
        });
      } else if (answer.type === "SUBJECTIVE" && answer.textResponse) {
        answersToCreate.push({
          questionId: answer.questionId,
          textAnswer: answer.textResponse,
        });
      }
    }

    await this.answerRepo.createMany(answersToCreate, userId);

    return {
      surveyId: request.surveyId,
      answersCount: request.answers.length,
      submittedAt: new Date(),
    };
  }

  async updateAnswer(
    answerId: string,
    data: {
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    },
    userId: string,
  ) {
    const answer = await this.getAnswerById(answerId);

    if (answer.userId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return this.answerRepo.update(answerId, data);
  }

  async deleteAnswer(answerId: string, userId: string): Promise<void> {
    const answer = await this.getAnswerById(answerId);

    if (answer.userId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.answerRepo.delete(answerId);
  }

  async deleteAnswersBySurvey(surveyId: string, userId: string): Promise<void> {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    await this.answerRepo.deleteBySurveyAndUser(surveyId, userId);
  }

  private validateAnswerData(
    request: CreateAnswerRequest,
    questionType: "MULTIPLE_CHOICE" | "SCALE" | "SUBJECTIVE",
  ) {
    if (questionType === "MULTIPLE_CHOICE") {
      if (!request.optionId) {
        const error = new Error("객관식 답변에는 선택지가 필요합니다.");
        error.cause = 400;
        throw error;
      }
    } else if (questionType === "SCALE") {
      if (request.scaleAnswer === undefined || request.scaleAnswer < 1 || request.scaleAnswer > 5) {
        const error = new Error("척도 값은 1~5 사이여야 합니다.");
        error.cause = 400;
        throw error;
      }
    } else if (questionType === "SUBJECTIVE") {
      if (!request.textAnswer || request.textAnswer.trim().length === 0) {
        const error = new Error("주관식 답변은 필수입니다.");
        error.cause = 400;
        throw error;
      }
      if (request.textAnswer.length > 100) {
        const error = new Error("주관식 답변은 100자를 초과할 수 없습니다.");
        error.cause = 400;
        throw error;
      }
    }
  }

  private validateSubmitAnswer(
    answer: SubmitAnswersRequest["answers"][0],
    questionType: "MULTIPLE_CHOICE" | "SCALE" | "SUBJECTIVE",
  ) {
    if (answer.type !== questionType) {
      const error = new Error("답변 타입이 질문 타입과 일치하지 않습니다.");
      error.cause = 400;
      throw error;
    }

    if (answer.type === "MULTIPLE_CHOICE") {
      if (!answer.selectedOptionIds || answer.selectedOptionIds.length === 0) {
        const error = new Error("최소 1개 이상의 선택지를 선택해주세요.");
        error.cause = 400;
        throw error;
      }
    } else if (answer.type === "SCALE") {
      if (answer.scaleValue === undefined || answer.scaleValue < 1 || answer.scaleValue > 5) {
        const error = new Error("척도 값은 1~5 사이여야 합니다.");
        error.cause = 400;
        throw error;
      }
    } else if (answer.type === "SUBJECTIVE") {
      if (!answer.textResponse || answer.textResponse.trim().length === 0) {
        const error = new Error("주관식 답변은 필수입니다.");
        error.cause = 400;
        throw error;
      }
      if (answer.textResponse.length > 100) {
        const error = new Error("주관식 답변은 100자를 초과할 수 없습니다.");
        error.cause = 400;
        throw error;
      }
    }
  }
}

export const surveyAnswerService = new SurveyAnswerService();

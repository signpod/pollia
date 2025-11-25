import {
  submitAnswersSchema,
  surveyAnswerInputSchema,
  surveyAnswerUpdateSchema,
} from "@/schemas/survey-answer";
import { surveyAnswerRepository } from "@/server/repositories/survey-answer/surveyAnswerRepository";
import { surveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyQuestionType } from "@prisma/client";
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
    const result = surveyAnswerInputSchema.safeParse(request);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const question = await this.questionRepo.findById(result.data.questionId);
    if (!question) {
      const error = new Error("질문을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    this.validateAnswerByType(result.data, question.type);

    return this.answerRepo.create({
      questionId: result.data.questionId,
      userId,
      optionId: result.data.optionId,
      textAnswer: result.data.textAnswer,
      scaleAnswer: result.data.scaleAnswer,
    });
  }

  async submitAnswers(request: SubmitAnswersRequest, userId: string) {
    const result = submitAnswersSchema.safeParse(request);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const survey = await this.surveyRepo.findById(result.data.surveyId);
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

    const questionIds = result.data.answers.map(a => a.questionId);
    const questions = await Promise.all(questionIds.map(id => this.questionRepo.findById(id)));

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question) {
        const error = new Error("일부 질문을 찾을 수 없습니다.");
        error.cause = 400;
        throw error;
      }

      if (question.surveyId !== result.data.surveyId) {
        const error = new Error("유효하지 않은 질문이 포함되어 있습니다.");
        error.cause = 400;
        throw error;
      }

      const answer = result.data.answers[i];
      if (!answer) continue;

      if (answer.type !== question.type) {
        const error = new Error("답변 타입이 질문 타입과 일치하지 않습니다.");
        error.cause = 400;
        throw error;
      }
    }

    await this.answerRepo.deleteByQuestionsAndUser(questionIds, userId);

    const answersToCreate: Array<{
      questionId: string;
      optionId?: string;
      textAnswer?: string;
      scaleAnswer?: number;
    }> = [];

    for (const answer of result.data.answers) {
      if (answer.type === SurveyQuestionType.MULTIPLE_CHOICE && answer.selectedOptionIds) {
        for (const optionId of answer.selectedOptionIds) {
          answersToCreate.push({
            questionId: answer.questionId,
            optionId,
          });
        }
      } else if (answer.type === SurveyQuestionType.SCALE && answer.scaleValue !== undefined) {
        answersToCreate.push({
          questionId: answer.questionId,
          scaleAnswer: answer.scaleValue,
        });
      } else if (answer.type === SurveyQuestionType.SUBJECTIVE && answer.textResponse) {
        answersToCreate.push({
          questionId: answer.questionId,
          textAnswer: answer.textResponse,
        });
      }
    }

    await this.answerRepo.createMany(answersToCreate, userId);

    return {
      surveyId: result.data.surveyId,
      answersCount: result.data.answers.length,
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
    const result = surveyAnswerUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const answer = await this.getAnswerById(answerId);

    if (answer.userId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    return this.answerRepo.update(answerId, result.data);
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

  private validateAnswerByType(
    data: { optionId?: string; textAnswer?: string; scaleAnswer?: number },
    questionType: SurveyQuestionType,
  ) {
    if (questionType === SurveyQuestionType.MULTIPLE_CHOICE && !data.optionId) {
      const error = new Error("객관식 답변에는 선택지가 필요합니다.");
      error.cause = 400;
      throw error;
    }
    if (questionType === SurveyQuestionType.SCALE && data.scaleAnswer === undefined) {
      const error = new Error("척도 값을 선택해주세요.");
      error.cause = 400;
      throw error;
    }
    if (questionType === SurveyQuestionType.SUBJECTIVE && !data.textAnswer) {
      const error = new Error("주관식 답변은 필수입니다.");
      error.cause = 400;
      throw error;
    }
  }
}

export const surveyAnswerService = new SurveyAnswerService();

import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import { QuizGradingService } from "./quizGradingService";

function createAnswer(
  actionId: string,
  score: number | null,
  correctOptionId: string | null,
  selectedOptionId: string,
) {
  return {
    action: { id: actionId, score, correctOptionId },
    options: [{ id: selectedOptionId }],
  };
}

function createActions(count: number, score: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `a${i + 1}`, score }));
}

function createCorrectAnswers(count: number, score: number) {
  return Array.from({ length: count }, (_, i) =>
    createAnswer(`a${i + 1}`, score, `opt${i + 1}`, `opt${i + 1}`),
  );
}

function createWrongAnswers(count: number, score: number) {
  return Array.from({ length: count }, (_, i) =>
    createAnswer(`a${i + 1}`, score, `opt${i + 1}`, `wrong${i + 1}`),
  );
}

describe("QuizGradingService", () => {
  let service: QuizGradingService;
  let mockActionRepo: jest.Mocked<ActionRepository>;
  let mockAnswerRepo: jest.Mocked<ActionAnswerRepository>;

  beforeEach(() => {
    mockActionRepo = {
      findDetailsByMissionId: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    mockAnswerRepo = {
      findByResponseId: jest.fn(),
    } as unknown as jest.Mocked<ActionAnswerRepository>;

    service = new QuizGradingService(mockActionRepo, mockAnswerRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculatePerfectScore", () => {
    it("모든 Action의 score를 합산한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([
        { id: "a1", score: 10 },
        { id: "a2", score: 20 },
        { id: "a3", score: 30 },
      ] as never);

      // When
      const result = await service.calculatePerfectScore("mission1");

      // Then
      expect(result).toBe(60);
      expect(mockActionRepo.findDetailsByMissionId).toHaveBeenCalledWith("mission1");
    });

    it("score가 null인 Action은 0으로 처리한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([
        { id: "a1", score: 10 },
        { id: "a2", score: null },
        { id: "a3", score: 20 },
      ] as never);

      // When
      const result = await service.calculatePerfectScore("mission1");

      // Then
      expect(result).toBe(30);
    });

    it("Action이 없으면 0을 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([]);

      // When
      const result = await service.calculatePerfectScore("mission1");

      // Then
      expect(result).toBe(0);
    });
  });

  describe("gradeResponse", () => {
    it("전부 정답인 경우 만점을 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([
        { id: "a1", score: 10 },
        { id: "a2", score: 20 },
      ] as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        {
          action: { id: "a1", score: 10, correctOptionId: "opt1" },
          options: [{ id: "opt1" }],
        },
        {
          action: { id: "a2", score: 20, correctOptionId: "opt2" },
          options: [{ id: "opt2" }],
        },
      ] as never);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(30);
      expect(result.perfectScore).toBe(30);
      expect(result.scoreRatio).toBe(100);
      expect(result.gradedItems).toHaveLength(2);
      expect(result.gradedItems[0]).toEqual({
        actionId: "a1",
        isCorrect: true,
        earnedScore: 10,
        maxScore: 10,
      });
    });

    it("전부 오답인 경우 0점을 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([
        { id: "a1", score: 10 },
        { id: "a2", score: 20 },
      ] as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        {
          action: { id: "a1", score: 10, correctOptionId: "opt1" },
          options: [{ id: "wrong1" }],
        },
        {
          action: { id: "a2", score: 20, correctOptionId: "opt2" },
          options: [{ id: "wrong2" }],
        },
      ] as never);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(0);
      expect(result.perfectScore).toBe(30);
      expect(result.scoreRatio).toBe(0);
      expect(result.gradedItems.every(item => !item.isCorrect)).toBe(true);
    });

    it("부분 정답인 경우 정확한 백분율을 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([
        { id: "a1", score: 10 },
        { id: "a2", score: 10 },
        { id: "a3", score: 10 },
      ] as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        {
          action: { id: "a1", score: 10, correctOptionId: "opt1" },
          options: [{ id: "opt1" }],
        },
        {
          action: { id: "a2", score: 10, correctOptionId: "opt2" },
          options: [{ id: "wrong" }],
        },
        {
          action: { id: "a3", score: 10, correctOptionId: "opt3" },
          options: [{ id: "opt3" }],
        },
      ] as never);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(20);
      expect(result.perfectScore).toBe(30);
      expect(result.scoreRatio).toBe(67);
    });

    it("score나 correctOptionId가 없는 Action은 채점에서 제외한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([{ id: "a1", score: 10 }] as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        {
          action: { id: "a1", score: 10, correctOptionId: "opt1" },
          options: [{ id: "opt1" }],
        },
        {
          action: { id: "a2", score: null, correctOptionId: null },
          options: [{ id: "opt2" }],
        },
        {
          action: { id: "a3", score: 5, correctOptionId: null },
          options: [{ id: "opt3" }],
        },
      ] as never);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.gradedItems).toHaveLength(1);
      expect(result.totalScore).toBe(10);
    });

    it("답변이 없으면 0점을 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([{ id: "a1", score: 10 }] as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([]);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(0);
      expect(result.perfectScore).toBe(10);
      expect(result.scoreRatio).toBe(0);
      expect(result.gradedItems).toHaveLength(0);
    });

    it("만점이 0인 경우 scoreRatio를 0으로 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([]);
      mockAnswerRepo.findByResponseId.mockResolvedValue([]);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.perfectScore).toBe(0);
      expect(result.scoreRatio).toBe(0);
    });
  });

  describe("resolveQuizCompletionId", () => {
    const completions = [
      { id: "c1", minScoreRatio: 0, maxScoreRatio: 49 },
      { id: "c2", minScoreRatio: 50, maxScoreRatio: 79 },
      { id: "c3", minScoreRatio: 80, maxScoreRatio: 100 },
    ];

    it("점수 비율에 맞는 completion을 반환한다 (하위 구간)", () => {
      expect(service.resolveQuizCompletionId(completions, 30)).toBe("c1");
    });

    it("점수 비율에 맞는 completion을 반환한다 (중간 구간)", () => {
      expect(service.resolveQuizCompletionId(completions, 65)).toBe("c2");
    });

    it("점수 비율에 맞는 completion을 반환한다 (상위 구간)", () => {
      expect(service.resolveQuizCompletionId(completions, 95)).toBe("c3");
    });

    it("경계값에서 정확히 매칭된다", () => {
      expect(service.resolveQuizCompletionId(completions, 0)).toBe("c1");
      expect(service.resolveQuizCompletionId(completions, 49)).toBe("c1");
      expect(service.resolveQuizCompletionId(completions, 50)).toBe("c2");
      expect(service.resolveQuizCompletionId(completions, 80)).toBe("c3");
      expect(service.resolveQuizCompletionId(completions, 100)).toBe("c3");
    });

    it("minScoreRatio/maxScoreRatio가 null이면 기본값(0~100)을 사용한다", () => {
      const nullCompletions = [{ id: "c-default", minScoreRatio: null, maxScoreRatio: null }];

      expect(service.resolveQuizCompletionId(nullCompletions, 50)).toBe("c-default");
      expect(service.resolveQuizCompletionId(nullCompletions, 0)).toBe("c-default");
      expect(service.resolveQuizCompletionId(nullCompletions, 100)).toBe("c-default");
    });

    it("매칭되는 구간이 없으면 null을 반환한다", () => {
      const gapCompletions = [
        { id: "c1", minScoreRatio: 0, maxScoreRatio: 30 },
        { id: "c2", minScoreRatio: 70, maxScoreRatio: 100 },
      ];

      expect(service.resolveQuizCompletionId(gapCompletions, 50)).toBeNull();
    });

    it("빈 배열이면 null을 반환한다", () => {
      expect(service.resolveQuizCompletionId([], 50)).toBeNull();
    });
  });

  describe("대규모 퀴즈 채점", () => {
    it("10문항 균등 배점 만점", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(10, 10) as never);
      mockAnswerRepo.findByResponseId.mockResolvedValue(createCorrectAnswers(10, 10) as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.totalScore).toBe(100);
      expect(result.perfectScore).toBe(100);
      expect(result.scoreRatio).toBe(100);
      expect(result.gradedItems).toHaveLength(10);
      expect(result.gradedItems.every(item => item.isCorrect)).toBe(true);
    });

    it("10문항 균등 배점 0점", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(10, 10) as never);
      mockAnswerRepo.findByResponseId.mockResolvedValue(createWrongAnswers(10, 10) as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.totalScore).toBe(0);
      expect(result.perfectScore).toBe(100);
      expect(result.scoreRatio).toBe(0);
      expect(result.gradedItems.every(item => !item.isCorrect)).toBe(true);
    });

    it("10문항 균등 배점 절반 정답", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(10, 10) as never);

      const answers = [
        ...Array.from({ length: 5 }, (_, i) =>
          createAnswer(`a${i + 1}`, 10, `opt${i + 1}`, `opt${i + 1}`),
        ),
        ...Array.from({ length: 5 }, (_, i) =>
          createAnswer(`a${i + 6}`, 10, `opt${i + 6}`, `wrong${i + 6}`),
        ),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.totalScore).toBe(50);
      expect(result.perfectScore).toBe(100);
      expect(result.scoreRatio).toBe(50);
    });

    it("혼합 배점 부분 정답 - 고배점만 정답", async () => {
      // Given: 1+2+3+4+5+5 = 만점 20
      const actions = [
        { id: "a1", score: 1 },
        { id: "a2", score: 2 },
        { id: "a3", score: 3 },
        { id: "a4", score: 4 },
        { id: "a5", score: 5 },
        { id: "a6", score: 5 },
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      const answers = [
        createAnswer("a1", 1, "opt1", "wrong1"),
        createAnswer("a2", 2, "opt2", "wrong2"),
        createAnswer("a3", 3, "opt3", "wrong3"),
        createAnswer("a4", 4, "opt4", "wrong4"),
        createAnswer("a5", 5, "opt5", "opt5"),
        createAnswer("a6", 5, "opt6", "opt6"),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.totalScore).toBe(10);
      expect(result.perfectScore).toBe(20);
      expect(result.scoreRatio).toBe(50);
      expect(result.gradedItems.filter(item => item.isCorrect)).toHaveLength(2);
      expect(result.gradedItems.filter(item => !item.isCorrect)).toHaveLength(4);
    });

    it("채점 불가 문항 혼합 - score 있는 문항만 채점 대상", async () => {
      // Given: score 있는 문항 3개(10점씩 = 만점 30), score 없는 문항 2개
      const actions = [
        { id: "a1", score: 10 },
        { id: "a2", score: 10 },
        { id: "a3", score: 10 },
        { id: "a4", score: null },
        { id: "a5", score: null },
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      const answers = [
        createAnswer("a1", 10, "opt1", "opt1"),
        createAnswer("a2", 10, "opt2", "opt2"),
        createAnswer("a3", 10, "opt3", "wrong3"),
        createAnswer("a4", null, null, "any4"),
        createAnswer("a5", null, null, "any5"),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.totalScore).toBe(20);
      expect(result.perfectScore).toBe(30);
      expect(result.scoreRatio).toBe(67);
      expect(result.gradedItems).toHaveLength(3);
      expect(result.gradedItems.filter(item => item.isCorrect)).toHaveLength(2);
    });
  });

  describe("scoreRatio 반올림 정확성", () => {
    it("1/3 정답 -> 33%", async () => {
      // Given: 3문항 x 10점 = 만점 30, 1문항 정답 = 10/30 = 33.33...%
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(3, 10) as never);

      const answers = [
        createAnswer("a1", 10, "opt1", "opt1"),
        createAnswer("a2", 10, "opt2", "wrong2"),
        createAnswer("a3", 10, "opt3", "wrong3"),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.scoreRatio).toBe(33);
    });

    it("2/3 정답 -> 67%", async () => {
      // Given: 3문항 x 10점, 2문항 정답 = 20/30 = 66.66...%
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(3, 10) as never);

      const answers = [
        createAnswer("a1", 10, "opt1", "opt1"),
        createAnswer("a2", 10, "opt2", "opt2"),
        createAnswer("a3", 10, "opt3", "wrong3"),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.scoreRatio).toBe(67);
    });

    it("1/7 정답 -> 14%", async () => {
      // Given: 7문항 x 10점, 1문항 정답 = 10/70 = 14.28...%
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(7, 10) as never);

      const answers = [
        createAnswer("a1", 10, "opt1", "opt1"),
        ...Array.from({ length: 6 }, (_, i) =>
          createAnswer(`a${i + 2}`, 10, `opt${i + 2}`, `wrong${i + 2}`),
        ),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.scoreRatio).toBe(14);
    });

    it("6/7 정답 -> 86%", async () => {
      // Given: 7문항 x 10점, 6문항 정답 = 60/70 = 85.71...%
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(7, 10) as never);

      const answers = [
        ...Array.from({ length: 6 }, (_, i) =>
          createAnswer(`a${i + 1}`, 10, `opt${i + 1}`, `opt${i + 1}`),
        ),
        createAnswer("a7", 10, "opt7", "wrong7"),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.scoreRatio).toBe(86);
    });

    it("1/2 정답 -> 정확히 50%", async () => {
      // Given: 2문항 x 10점, 1문항 정답 = 10/20 = 50%
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(createActions(2, 10) as never);

      const answers = [
        createAnswer("a1", 10, "opt1", "opt1"),
        createAnswer("a2", 10, "opt2", "wrong2"),
      ];
      mockAnswerRepo.findByResponseId.mockResolvedValue(answers as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.scoreRatio).toBe(50);
    });
  });
});

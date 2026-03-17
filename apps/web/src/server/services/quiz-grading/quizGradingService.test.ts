import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import { QuizGradingService } from "./quizGradingService";

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
});

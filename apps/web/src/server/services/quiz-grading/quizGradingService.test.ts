import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import { ActionType, MatchMode } from "@prisma/client";
import { QuizGradingService } from "./quizGradingService";

function createActionWithOptions(
  id: string,
  score: number | null,
  type: ActionType,
  options: Array<{ id: string; title: string; isCorrect: boolean }>,
  matchMode: MatchMode | null = null,
) {
  return {
    id,
    score,
    type,
    matchMode,
    options: options.map((opt, i) => ({ ...opt, order: i })),
  };
}

function createOptionBasedAnswer(
  actionId: string,
  score: number | null,
  type: ActionType,
  selectedOptionIds: string[],
) {
  return {
    action: { id: actionId, score, type },
    options: selectedOptionIds.map(id => ({ id })),
    textAnswer: null,
  };
}

function createTextAnswer(actionId: string, score: number | null, textAnswer: string | null) {
  return {
    action: { id: actionId, score, type: ActionType.SHORT_TEXT },
    options: [],
    textAnswer,
  };
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

  describe("gradeResponse - 단일 정답 (옵션 기반)", () => {
    it("전부 정답인 경우 만점을 반환한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.OX, [
          { id: "opt1", title: "O", isCorrect: true },
          { id: "opt1-x", title: "X", isCorrect: false },
        ]),
        createActionWithOptions("a2", 20, ActionType.MULTIPLE_CHOICE, [
          { id: "opt2", title: "A", isCorrect: true },
          { id: "opt2-b", title: "B", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.OX, ["opt1"]),
        createOptionBasedAnswer("a2", 20, ActionType.MULTIPLE_CHOICE, ["opt2"]),
      ] as never);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(30);
      expect(result.perfectScore).toBe(30);
      expect(result.scoreRatio).toBe(100);
      expect(result.gradedItems).toHaveLength(2);
    });

    it("전부 오답인 경우 0점을 반환한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.OX, [
          { id: "opt1", title: "O", isCorrect: true },
          { id: "opt1-x", title: "X", isCorrect: false },
        ]),
        createActionWithOptions("a2", 20, ActionType.MULTIPLE_CHOICE, [
          { id: "opt2", title: "A", isCorrect: true },
          { id: "opt2-b", title: "B", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.OX, ["opt1-x"]),
        createOptionBasedAnswer("a2", 20, ActionType.MULTIPLE_CHOICE, ["opt2-b"]),
      ] as never);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(0);
      expect(result.perfectScore).toBe(30);
      expect(result.scoreRatio).toBe(0);
    });

    it("답변이 없으면 0점을 반환한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.OX, [
          { id: "opt1", title: "O", isCorrect: true },
          { id: "opt1-x", title: "X", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);
      mockAnswerRepo.findByResponseId.mockResolvedValue([]);

      // When
      const result = await service.gradeResponse("response1", "mission1");

      // Then
      expect(result.totalScore).toBe(0);
      expect(result.gradedItems).toHaveLength(0);
    });
  });

  describe("gradeResponse - 복수 정답", () => {
    it("복수 정답을 모두 선택하면 정답으로 처리한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.MULTIPLE_CHOICE, [
          { id: "opt-a", title: "A", isCorrect: true },
          { id: "opt-b", title: "B", isCorrect: true },
          { id: "opt-c", title: "C", isCorrect: false },
          { id: "opt-d", title: "D", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.MULTIPLE_CHOICE, ["opt-a", "opt-b"]),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
      expect(result.totalScore).toBe(10);
    });

    it("복수 정답 중 일부만 선택하면 오답으로 처리한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.MULTIPLE_CHOICE, [
          { id: "opt-a", title: "A", isCorrect: true },
          { id: "opt-b", title: "B", isCorrect: true },
          { id: "opt-c", title: "C", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.MULTIPLE_CHOICE, ["opt-a"]),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
      expect(result.totalScore).toBe(0);
    });

    it("정답 외에 추가로 선택하면 오답으로 처리한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.MULTIPLE_CHOICE, [
          { id: "opt-a", title: "A", isCorrect: true },
          { id: "opt-b", title: "B", isCorrect: false },
          { id: "opt-c", title: "C", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.MULTIPLE_CHOICE, ["opt-a", "opt-b"]),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
    });
  });

  describe("gradeResponse - SHORT_TEXT (단어 퀴즈)", () => {
    it("EXACT 모드에서 완전 일치하면 정답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "서울", isCorrect: true }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "서울"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
      expect(result.totalScore).toBe(10);
    });

    it("EXACT 모드에서 대소문자를 구분하지 않는다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "Seoul", isCorrect: true }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "seoul"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
    });

    it("EXACT 모드에서 부분 일치는 오답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "서울", isCorrect: true }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "서울특별시"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
    });

    it("CONTAINS 모드에서 포함하면 정답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "서울", isCorrect: true }],
          MatchMode.CONTAINS,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "서울특별시"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
    });

    it("CONTAINS 모드에서 포함하지 않으면 오답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "서울", isCorrect: true }],
          MatchMode.CONTAINS,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "부산"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
    });

    it("복수 정답 텍스트 중 하나라도 맞으면 정답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [
            { id: "ans1", title: "서울", isCorrect: true },
            { id: "ans2", title: "Seoul", isCorrect: true },
          ],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "Seoul"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
    });

    it("matchMode가 null이면 EXACT로 동작한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.SHORT_TEXT, [
          { id: "ans1", title: "정답", isCorrect: true },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "정답"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
    });

    it("textAnswer가 null이면 오답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "정답", isCorrect: true }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, null),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
    });

    it("textAnswer가 공백만 있으면 오답이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "정답", isCorrect: true }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "   "),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
    });
  });

  describe("gradeResponse - score나 정답 옵션이 없는 문항은 채점에서 제외", () => {
    it("score가 null인 문항은 채점에서 제외한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.OX, [
          { id: "opt1", title: "O", isCorrect: true },
          { id: "opt1-x", title: "X", isCorrect: false },
        ]),
        createActionWithOptions("a2", null, ActionType.OX, [
          { id: "opt2", title: "O", isCorrect: true },
          { id: "opt2-x", title: "X", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.OX, ["opt1"]),
        createOptionBasedAnswer("a2", null, ActionType.OX, ["opt2"]),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems).toHaveLength(1);
    });

    it("isCorrect 옵션이 없는 문항은 채점에서 제외한다", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.MULTIPLE_CHOICE, [
          { id: "opt-a", title: "A", isCorrect: false },
          { id: "opt-b", title: "B", isCorrect: false },
        ]),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.MULTIPLE_CHOICE, ["opt-a"]),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems).toHaveLength(0);
    });
  });

  describe("gradeResponse - 혼합 문항 채점", () => {
    it("OX, MULTIPLE_CHOICE, SHORT_TEXT 혼합 채점", async () => {
      // Given
      const actions = [
        createActionWithOptions("a1", 10, ActionType.OX, [
          { id: "ox-o", title: "O", isCorrect: true },
          { id: "ox-x", title: "X", isCorrect: false },
        ]),
        createActionWithOptions("a2", 20, ActionType.MULTIPLE_CHOICE, [
          { id: "mc-a", title: "A", isCorrect: true },
          { id: "mc-b", title: "B", isCorrect: true },
          { id: "mc-c", title: "C", isCorrect: false },
        ]),
        createActionWithOptions(
          "a3",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "st-1", title: "정답", isCorrect: true }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.OX, ["ox-o"]),
        createOptionBasedAnswer("a2", 20, ActionType.MULTIPLE_CHOICE, ["mc-a", "mc-b"]),
        createTextAnswer("a3", 10, "오답"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.totalScore).toBe(30);
      expect(result.perfectScore).toBe(40);
      expect(result.scoreRatio).toBe(75);
      expect(result.gradedItems).toHaveLength(3);
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
      expect(result.gradedItems[1]!.isCorrect).toBe(true);
      expect(result.gradedItems[2]!.isCorrect).toBe(false);
    });
  });

  describe("gradeResponse - SHORT_TEXT isCorrect 미설정 (퀴즈 에디터 기본 동작)", () => {
    it("isCorrect가 없는 SHORT_TEXT 옵션도 정답으로 처리한다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "서울", isCorrect: false }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "서울"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems).toHaveLength(1);
      expect(result.gradedItems[0]!.isCorrect).toBe(true);
      expect(result.totalScore).toBe(10);
    });

    it("isCorrect가 없는 SHORT_TEXT에서 오답은 0점이다", async () => {
      // Given
      const actions = [
        createActionWithOptions(
          "a1",
          10,
          ActionType.SHORT_TEXT,
          [{ id: "ans1", title: "서울", isCorrect: false }],
          MatchMode.EXACT,
        ),
      ];
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createTextAnswer("a1", 10, "부산"),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.gradedItems).toHaveLength(1);
      expect(result.gradedItems[0]!.isCorrect).toBe(false);
      expect(result.totalScore).toBe(0);
    });
  });

  describe("scoreRatio 반올림 정확성", () => {
    it("1/3 정답 -> 33%", async () => {
      // Given
      const actions = Array.from({ length: 3 }, (_, i) =>
        createActionWithOptions(`a${i + 1}`, 10, ActionType.OX, [
          { id: `opt${i + 1}`, title: "O", isCorrect: true },
          { id: `opt${i + 1}-x`, title: "X", isCorrect: false },
        ]),
      );
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions as never);

      mockAnswerRepo.findByResponseId.mockResolvedValue([
        createOptionBasedAnswer("a1", 10, ActionType.OX, ["opt1"]),
        createOptionBasedAnswer("a2", 10, ActionType.OX, ["opt2-x"]),
        createOptionBasedAnswer("a3", 10, ActionType.OX, ["opt3-x"]),
      ] as never);

      // When
      const result = await service.gradeResponse("r1", "m1");

      // Then
      expect(result.scoreRatio).toBe(33);
    });

    it("만점이 0인 경우 scoreRatio를 0으로 반환한다", async () => {
      // Given
      mockActionRepo.findDetailsByMissionId.mockResolvedValue([]);
      mockAnswerRepo.findByResponseId.mockResolvedValue([]);

      // When
      const result = await service.gradeResponse("r1", "m1");

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

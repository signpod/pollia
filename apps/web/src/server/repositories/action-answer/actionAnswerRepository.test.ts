import prisma from "@/database/utils/prisma/client";
import { ActionAnswerRepository } from "./actionAnswerRepository";

jest.mock("@/database/utils/prisma/client", () => ({
  __esModule: true,
  default: {
    actionOption: {
      findMany: jest.fn(),
    },
    actionAnswer: {
      findMany: jest.fn(),
    },
  },
}));

describe("ActionAnswerRepository - collectInvalidAnswersByOptions", () => {
  let repository: ActionAnswerRepository;
  const mockActionOptionFindMany = prisma.actionOption.findMany as jest.Mock;
  const mockActionAnswerFindMany = prisma.actionAnswer.findMany as jest.Mock;

  beforeEach(() => {
    repository = new ActionAnswerRepository();
    jest.clearAllMocks();
  });

  describe("collectInvalidAnswersByOptions", () => {
    it("선형 분기 구조에서 유효하지 않은 답변을 수집한다", async () => {
      mockActionOptionFindMany.mockResolvedValue([
        {
          id: "opt-1",
          nextActionId: "action-2",
          nextCompletionId: null,
        },
      ] as any);

      mockActionAnswerFindMany.mockResolvedValue([
        {
          id: "answer-2",
          actionId: "action-2",
          responseId: "response-1",
          options: [
            {
              id: "opt-2",
              nextActionId: "action-3",
              nextCompletionId: null,
            },
          ],
        },
        {
          id: "answer-3",
          actionId: "action-3",
          responseId: "response-1",
          options: [
            {
              id: "opt-3",
              nextActionId: null,
              nextCompletionId: null,
            },
          ],
        },
      ] as any);

      const result = await repository.collectInvalidAnswersByOptions("response-1", ["opt-1"]);

      expect(result).toEqual(["answer-2", "answer-3"]);
      expect(mockActionOptionFindMany).toHaveBeenCalledWith({
        where: { id: { in: ["opt-1"] } },
        select: {
          id: true,
          nextActionId: true,
          nextCompletionId: true,
        },
      });
      expect(mockActionAnswerFindMany).toHaveBeenCalledWith({
        where: { responseId: "response-1" },
        include: {
          options: {
            select: {
              id: true,
              nextActionId: true,
              nextCompletionId: true,
            },
          },
        },
      });
    });

    it("순환 참조를 올바르게 처리한다", async () => {
      mockActionOptionFindMany.mockResolvedValue([
        {
          id: "opt-1",
          nextActionId: "action-2",
          nextCompletionId: null,
        },
      ] as any);

      mockActionAnswerFindMany.mockResolvedValue([
        {
          id: "answer-2",
          actionId: "action-2",
          responseId: "response-1",
          options: [
            {
              id: "opt-2",
              nextActionId: "action-3",
              nextCompletionId: null,
            },
          ],
        },
        {
          id: "answer-3",
          actionId: "action-3",
          responseId: "response-1",
          options: [
            {
              id: "opt-3",
              nextActionId: "action-2",
              nextCompletionId: null,
            },
          ],
        },
      ] as any);

      const result = await repository.collectInvalidAnswersByOptions("response-1", ["opt-1"]);

      expect(result).toEqual(["answer-2", "answer-3"]);
    });

    it("완료 화면 분기에서 탐색을 중단한다", async () => {
      mockActionOptionFindMany.mockResolvedValue([
        {
          id: "opt-1",
          nextActionId: "action-2",
          nextCompletionId: null,
        },
      ] as any);

      mockActionAnswerFindMany.mockResolvedValue([
        {
          id: "answer-2",
          actionId: "action-2",
          responseId: "response-1",
          options: [
            {
              id: "opt-2",
              nextActionId: "action-3",
              nextCompletionId: "completion-1",
            },
          ],
        },
        {
          id: "answer-3",
          actionId: "action-3",
          responseId: "response-1",
          options: [],
        },
      ] as any);

      const result = await repository.collectInvalidAnswersByOptions("response-1", ["opt-1"]);

      expect(result).toEqual(["answer-2"]);
    });

    it("답변이 없는 액션은 건너뛴다", async () => {
      mockActionOptionFindMany.mockResolvedValue([
        {
          id: "opt-1",
          nextActionId: "action-2",
          nextCompletionId: null,
        },
      ] as any);

      mockActionAnswerFindMany.mockResolvedValue([]);

      const result = await repository.collectInvalidAnswersByOptions("response-1", ["opt-1"]);

      expect(result).toEqual([]);
    });

    it("여러 분기가 있는 경우 모든 경로를 탐색한다", async () => {
      mockActionOptionFindMany.mockResolvedValue([
        {
          id: "opt-1",
          nextActionId: "action-2",
          nextCompletionId: null,
        },
      ] as any);

      mockActionAnswerFindMany.mockResolvedValue([
        {
          id: "answer-2",
          actionId: "action-2",
          responseId: "response-1",
          options: [
            {
              id: "opt-2a",
              nextActionId: "action-3",
              nextCompletionId: null,
            },
            {
              id: "opt-2b",
              nextActionId: "action-4",
              nextCompletionId: null,
            },
          ],
        },
        {
          id: "answer-3",
          actionId: "action-3",
          responseId: "response-1",
          options: [],
        },
        {
          id: "answer-4",
          actionId: "action-4",
          responseId: "response-1",
          options: [],
        },
      ] as any);

      const result = await repository.collectInvalidAnswersByOptions("response-1", ["opt-1"]);

      expect(result).toEqual(["answer-2", "answer-3", "answer-4"]);
    });

    it("nextActionId가 null인 경우 탐색을 중단한다", async () => {
      mockActionOptionFindMany.mockResolvedValue([
        {
          id: "opt-1",
          nextActionId: "action-2",
          nextCompletionId: null,
        },
      ] as any);

      mockActionAnswerFindMany.mockResolvedValue([
        {
          id: "answer-2",
          actionId: "action-2",
          responseId: "response-1",
          options: [
            {
              id: "opt-2",
              nextActionId: null,
              nextCompletionId: null,
            },
          ],
        },
      ] as any);

      const result = await repository.collectInvalidAnswersByOptions("response-1", ["opt-1"]);

      expect(result).toEqual(["answer-2"]);
    });
  });
});

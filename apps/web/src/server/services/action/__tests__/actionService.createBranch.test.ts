import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  createMockActionResponse,
  expectServiceErrorWithCause,
  mockMissionFactory,
} from "../testUtils";

describe("ActionService - createBranchAction", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("정상 케이스", () => {
    it("정확히 2개 옵션으로 BRANCH 액션을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "다음 중 선택하세요",
        description: "경로를 선택해주세요",
        imageUrl: undefined,
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          {
            title: "경로 A",
            description: "첫 번째 경로",
            imageUrl: undefined,
            order: 0,
            imageFileUploadId: undefined,
            nextActionId: "action-next-1",
          },
          {
            title: "경로 B",
            description: "두 번째 경로",
            imageUrl: undefined,
            order: 1,
            imageFileUploadId: undefined,
            nextActionId: "action-next-2",
          },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.BRANCH);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createBranchAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.BRANCH);
      expect(result.order).toBe(request.order);
      expect(result.nextActionId).toBeNull();
      expect(result.createdAt).toBeDefined();

      expect(ctx.mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          hasOther: false,
          type: ActionType.BRANCH,
          order: request.order,
          maxSelections: 1,
          isRequired: true,
        },
        [
          {
            title: "경로 A",
            description: "첫 번째 경로",
            imageUrl: undefined,
            order: 0,
            imageFileUploadId: undefined,
            nextActionId: "action-next-1",
            nextCompletionId: null,
          },
          {
            title: "경로 B",
            description: "두 번째 경로",
            imageUrl: undefined,
            order: 1,
            imageFileUploadId: undefined,
            nextActionId: "action-next-2",
            nextCompletionId: null,
          },
        ],
        "user1",
      );
    });

    it("nextActionId가 null인 옵션으로 BRANCH 액션을 생성한다", async () => {
      // Given: 나중에 연결할 수 있도록 nextActionId가 null
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          {
            title: "경로 A",
            order: 0,
            nextActionId: null,
          },
          {
            title: "경로 B",
            order: 1,
            nextActionId: null,
          },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.BRANCH);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createBranchAction(request, "user1");

      // Then
      expect(result.type).toBe(ActionType.BRANCH);
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActionType.BRANCH,
          maxSelections: 1 as const,
        }),
        expect.arrayContaining([
          expect.objectContaining({
            title: "경로 A",
            nextActionId: null,
          }),
          expect.objectContaining({
            title: "경로 B",
            nextActionId: null,
          }),
        ]),
        "user1",
      );
    });

    it("한 옵션만 nextActionId를 가진 BRANCH 액션을 생성한다", async () => {
      // Given: 부분적으로 연결된 분기
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          {
            title: "경로 A",
            order: 0,
            nextActionId: "action-next-1",
          },
          {
            title: "경로 B",
            order: 1,
            nextActionId: null,
          },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.BRANCH);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createBranchAction(request, "user1");

      // Then
      expect(result.type).toBe(ActionType.BRANCH);
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalled();
    });

    it("maxSelections가 자동으로 1로 설정된다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.BRANCH);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      await ctx.service.createBranchAction(request, "user1");

      // Then
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        expect.objectContaining({
          maxSelections: 1 as const,
        }),
        expect.anything(),
        "user1",
      );
    });

    it("hasOther가 자동으로 false로 설정된다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.BRANCH);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      await ctx.service.createBranchAction(request, "user1");

      // Then
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActionType.BRANCH,
        }),
        expect.anything(),
        "user1",
      );
    });
  });

  describe("경곗값 케이스", () => {
    it("옵션이 0개일 때 validation 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "분기 액션은 정확히 2개의 선택지가 필요합니다.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 1개일 때 validation 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [{ title: "옵션 1", order: 0 }],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "분기 액션은 정확히 2개의 선택지가 필요합니다.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 3개일 때 validation 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
          { title: "옵션 3", order: 2 },
        ],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "분기 액션은 정확히 2개의 선택지가 필요합니다.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("Validation 에러 케이스", () => {
    it("title이 빈 문자열일 때 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "제목을 입력해주세요.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("title이 100자를 초과할 때 에러를 던진다", async () => {
      // Given
      const longTitle = "a".repeat(101);
      const request = {
        missionId: "mission1",
        title: longTitle,
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "제목은 100자를 초과할 수 없습니다.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션의 title이 빈 문자열일 때 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "옵션 제목을 입력해주세요.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("maxSelections가 1이 아닐 때 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 2 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      } as any;

      // When & Then
      await expect(ctx.service.createBranchAction(request, "user1")).rejects.toThrow();

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("hasOther가 true일 때 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: true as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      } as any;

      // When & Then
      await expect(ctx.service.createBranchAction(request, "user1")).rejects.toThrow();

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("권한 검증 케이스", () => {
    it("Mission이 없을 때 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Mission 소유자가 아닐 때 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createBranchAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("missionId가 없는 경우", () => {
    it("missionId 없이 BRANCH 액션을 생성한다", async () => {
      // Given
      const request = {
        title: "경로 선택",
        order: 0,
        maxSelections: 1 as const,
        hasOther: false as const,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.BRANCH, {
        missionId: null,
      });

      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createBranchAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("");
      expect(result.type).toBe(ActionType.BRANCH);
      expect(ctx.mockMissionRepo.findById).not.toHaveBeenCalled();
    });
  });
});

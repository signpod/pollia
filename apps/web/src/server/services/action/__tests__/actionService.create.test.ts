import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  mockMissionFactory,
} from "../testUtils";

describe("ActionService - Create", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMultipleChoiceAction", () => {
    it("Multiple Choice Action을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "좋아하는 색은?",
        description: "하나를 선택하세요",
        imageUrl: undefined,
        order: 0,
        maxSelections: 1,
        options: [
          {
            title: "빨강",
            description: undefined,
            imageUrl: undefined,
            order: 0,
            imageFileUploadId: undefined,
          },
          {
            title: "파랑",
            description: undefined,
            imageUrl: undefined,
            order: 1,
            imageFileUploadId: undefined,
          },
        ],
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "mission1",
        title: request.title,
        type: ActionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: request.maxSelections,
        description: request.description,
        imageUrl: null,
        isRequired: false,
        imageFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createMultipleChoiceAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.MULTIPLE_CHOICE);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: ActionType.MULTIPLE_CHOICE,
          order: request.order,
          maxSelections: request.maxSelections,
        },
        request.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
          imageFileUploadId: opt.imageFileUploadId,
        })),
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.createMultipleChoiceAction(request, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      try {
        await ctx.service.createMultipleChoiceAction(request, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.createMultipleChoiceAction(request, "user1")).rejects.toThrow(
        "존재하지 않는 미션입니다.",
      );
    });

    it("옵션이 2개 미만이면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [{ title: "옵션 1", order: 0 }],
      };

      // When & Then
      await expect(ctx.service.createMultipleChoiceAction(request, "user1")).rejects.toThrow(
        "최소 2개 이상의 항목이 필요합니다.",
      );

      try {
        await ctx.service.createMultipleChoiceAction(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [],
      };

      // When & Then
      await expect(ctx.service.createMultipleChoiceAction(request, "user1")).rejects.toThrow(
        "최소 2개 이상의 항목이 필요합니다.",
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("createScaleAction", () => {
    it("Scale Action을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "만족도를 평가해주세요",
        description: "1-5점",
        imageUrl: undefined,
        order: 0,
        options: [
          {
            title: "매우 불만족",
            description: undefined,
            imageUrl: undefined,
            order: 0,
            imageFileUploadId: undefined,
          },
          {
            title: "불만족",
            description: undefined,
            imageUrl: undefined,
            order: 1,
            imageFileUploadId: undefined,
          },
          {
            title: "보통",
            description: undefined,
            imageUrl: undefined,
            order: 2,
            imageFileUploadId: undefined,
          },
          {
            title: "만족",
            description: undefined,
            imageUrl: undefined,
            order: 3,
            imageFileUploadId: undefined,
          },
          {
            title: "매우 만족",
            description: undefined,
            imageUrl: undefined,
            order: 4,
            imageFileUploadId: undefined,
          },
        ],
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "mission1",
        title: request.title,
        type: ActionType.SCALE,
        order: request.order,
        maxSelections: null,
        description: request.description,
        imageUrl: null,
        isRequired: false,
        imageFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createScaleAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.SCALE);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: ActionType.SCALE,
          order: request.order,
        },
        request.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
          imageFileUploadId: opt.imageFileUploadId,
        })),
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "만족도를 평가해주세요",
        order: 0,
        options: [
          { title: "척도 1", order: 0 },
          { title: "척도 2", order: 1 },
          { title: "척도 3", order: 2 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.createScaleAction(request, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      try {
        await ctx.service.createScaleAction(request, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "만족도를 평가해주세요",
        order: 0,
        options: [
          { title: "척도 1", order: 0 },
          { title: "척도 2", order: 1 },
          { title: "척도 3", order: 2 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.createScaleAction(request, "user1")).rejects.toThrow(
        "존재하지 않는 미션입니다.",
      );

      try {
        await ctx.service.createScaleAction(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 3개 미만이면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "만족도를 평가해주세요",
        order: 0,
        options: [
          { title: "척도 1", order: 0 },
          { title: "척도 2", order: 1 },
        ],
      };

      // When & Then
      await expect(ctx.service.createScaleAction(request, "user1")).rejects.toThrow(
        "최소 3개 이상의 항목이 필요합니다.",
      );

      try {
        await ctx.service.createScaleAction(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("createSubjectiveAction", () => {
    it("Subjective Action을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "의견을 자유롭게 작성해주세요",
        description: "상세히 작성해주세요",
        imageUrl: undefined,
        order: 0,
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "mission1",
        title: request.title,
        type: ActionType.SUBJECTIVE,
        order: request.order,
        maxSelections: null,
        description: request.description,
        imageUrl: null,
        isRequired: false,
        imageFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createSubjectiveAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.SUBJECTIVE);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          imageFileUploadId: undefined,
          type: ActionType.SUBJECTIVE,
          order: request.order,
        },
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "의견을 자유롭게 작성해주세요",
        order: 0,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.createSubjectiveAction(request, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      try {
        await ctx.service.createSubjectiveAction(request, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "의견을 자유롭게 작성해주세요",
        order: 0,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.createSubjectiveAction(request, "user1")).rejects.toThrow(
        "존재하지 않는 미션입니다.",
      );

      try {
        await ctx.service.createSubjectiveAction(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("createEitherOrAction", () => {
    it("Either Or Action을 성공적으로 생성한다 (missionId 없음)", async () => {
      // Given
      const request = {
        title: "A와 B 중 선택하세요",
        order: 0,
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: null,
        title: request.title,
        type: ActionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: null,
        description: null,
        imageUrl: null,
        isRequired: false,
        imageFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createEitherOrAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.MULTIPLE_CHOICE);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
    });

    it("Either Or Action을 성공적으로 생성한다 (missionId 있음)", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "A와 B 중 선택하세요",
        order: 0,
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "mission1",
        title: request.title,
        type: ActionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: null,
        description: null,
        imageUrl: null,
        isRequired: false,
        imageFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createEitherOrAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.MULTIPLE_CHOICE);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "A와 B 중 선택하세요",
        order: 0,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.createEitherOrAction(request, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      try {
        await ctx.service.createEitherOrAction(request, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "A와 B 중 선택하세요",
        order: 0,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.createEitherOrAction(request, "user1")).rejects.toThrow(
        "존재하지 않는 미션입니다.",
      );

      try {
        await ctx.service.createEitherOrAction(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        order: 0,
      };

      // When & Then
      await expect(ctx.service.createEitherOrAction(request, "user1")).rejects.toThrow(
        "제목을 입력해주세요.",
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });
});

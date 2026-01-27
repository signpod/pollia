import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  createMockActionResponse,
  expectServiceErrorWithCause,
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
        isRequired: true,
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
      const mockCreatedAction = createMockActionResponse(request, ActionType.MULTIPLE_CHOICE);

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
          imageFileUploadId: undefined,
          type: ActionType.MULTIPLE_CHOICE,
          order: request.order,
          maxSelections: request.maxSelections,
          isRequired: true,
        },
        request.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
          imageFileUploadId: opt.imageFileUploadId,
          nextActionId: null,
          nextCompletionId: null,
        })),
        "user1",
      );
    });

    it("isRequired를 false로 설정하여 선택 액션을 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "좋아하는 색은?",
        order: 0,
        maxSelections: 1,
        isRequired: false,
        options: [
          { title: "빨강", order: 0 },
          { title: "파랑", order: 1 },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.MULTIPLE_CHOICE);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createMultipleChoiceAction(request, "user1");

      // Then
      expect(result.isRequired).toBe(false);
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        expect.objectContaining({
          isRequired: false,
        }),
        expect.anything(),
        "user1",
      );
    });

    it("isRequired를 명시적으로 true로 설정하여 필수 액션을 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "좋아하는 색은?",
        order: 0,
        maxSelections: 1,
        isRequired: true,
        options: [
          { title: "빨강", order: 0 },
          { title: "파랑", order: 1 },
        ],
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.MULTIPLE_CHOICE);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createMultipleChoiceAction(request, "user1");

      // Then
      expect(result.isRequired).toBe(true);
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        isRequired: true,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createMultipleChoiceAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "액션",
        order: 0,
        maxSelections: 1,
        isRequired: true,
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
        isRequired: true,
        options: [{ title: "옵션 1", order: 0 }],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createMultipleChoiceAction(request, "user1"),
        "최소 2개 이상의 항목이 필요합니다.",
        400,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        isRequired: true,
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
        isRequired: true,
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
      const mockCreatedAction = createMockActionResponse(request, ActionType.SCALE);

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
          imageFileUploadId: undefined,
          type: ActionType.SCALE,
          order: request.order,
          isRequired: true,
        },
        request.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
          imageFileUploadId: opt.imageFileUploadId,
          nextActionId: null,
          nextCompletionId: null,
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
        isRequired: true,
        options: [
          { title: "척도 1", order: 0 },
          { title: "척도 2", order: 1 },
          { title: "척도 3", order: 2 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createScaleAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "만족도를 평가해주세요",
        order: 0,
        isRequired: true,
        options: [
          { title: "척도 1", order: 0 },
          { title: "척도 2", order: 1 },
          { title: "척도 3", order: 2 },
        ],
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createScaleAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 3개 미만이면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "만족도를 평가해주세요",
        order: 0,
        isRequired: true,
        options: [
          { title: "척도 1", order: 0 },
          { title: "척도 2", order: 1 },
        ],
      };

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createScaleAction(request, "user1"),
        "최소 3개 이상의 항목이 필요합니다.",
        400,
      );

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
        isRequired: true,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.SUBJECTIVE);

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
          isRequired: true,
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
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createSubjectiveAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "의견을 자유롭게 작성해주세요",
        order: 0,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createSubjectiveAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("createShortTextAction", () => {
    it("Short Text Action을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "이름을 입력해주세요",
        description: "실명을 입력해주세요",
        imageUrl: undefined,
        order: 0,
        isRequired: true,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.SHORT_TEXT);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createShortTextAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.SHORT_TEXT);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          imageFileUploadId: undefined,
          type: ActionType.SHORT_TEXT,
          order: request.order,
          isRequired: true,
        },
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "이름을 입력해주세요",
        order: 0,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createShortTextAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "이름을 입력해주세요",
        order: 0,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createShortTextAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("createEitherOrAction", () => {
    it("Either Or Action을 성공적으로 생성한다 (missionId 없음)", async () => {
      // Given
      const request = {
        title: "A와 B 중 선택하세요",
        order: 0,
        isRequired: true,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.MULTIPLE_CHOICE, {
        missionId: null,
      });

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
        isRequired: true,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.MULTIPLE_CHOICE);

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
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createEitherOrAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "A와 B 중 선택하세요",
        order: 0,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createEitherOrAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        order: 0,
        isRequired: true,
      };

      // When & Then
      await expect(ctx.service.createEitherOrAction(request, "user1")).rejects.toThrow(
        "제목을 입력해주세요.",
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("createDateAction", () => {
    it("Date Action을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "방문 가능한 날짜를 선택해주세요",
        description: "최대 3개까지 선택 가능합니다",
        imageUrl: undefined,
        order: 0,
        maxSelections: 3,
        isRequired: true,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.DATE);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createDateAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.DATE);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          imageFileUploadId: undefined,
          type: ActionType.DATE,
          order: request.order,
          maxSelections: request.maxSelections,
          isRequired: true,
        },
        "user1",
      );
    });

    it("isRequired를 false로 설정하여 선택 액션을 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "방문 가능한 날짜를 선택해주세요",
        order: 0,
        maxSelections: 1,
        isRequired: false,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.DATE);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createDateAction(request, "user1");

      // Then
      expect(result.isRequired).toBe(false);
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isRequired: false,
          maxSelections: 1,
        }),
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "방문 가능한 날짜를 선택해주세요",
        order: 0,
        maxSelections: 1,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createDateAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "방문 가능한 날짜를 선택해주세요",
        order: 0,
        maxSelections: 1,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createDateAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("maxSelections가 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "방문 가능한 날짜를 선택해주세요",
        order: 0,
        isRequired: true,
      };

      // When & Then
      await expect(ctx.service.createDateAction(request as never, "user1")).rejects.toThrow();

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("createTimeAction", () => {
    it("Time Action을 성공적으로 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "방문 가능한 시간을 선택해주세요",
        description: "최대 2개까지 선택 가능합니다",
        imageUrl: undefined,
        order: 0,
        maxSelections: 2,
        isRequired: true,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.TIME);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createTimeAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.missionId).toBe("mission1");
      expect(result.title).toBe(request.title);
      expect(result.type).toBe(ActionType.TIME);
      expect(result.order).toBe(request.order);
      expect(result.createdAt).toBeDefined();
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          imageFileUploadId: undefined,
          type: ActionType.TIME,
          order: request.order,
          maxSelections: request.maxSelections,
          isRequired: true,
        },
        "user1",
      );
    });

    it("isRequired를 false로 설정하여 선택 액션을 생성한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "방문 가능한 시간을 선택해주세요",
        order: 0,
        maxSelections: 1,
        isRequired: false,
      };
      const mockCreatedAction = createMockActionResponse(request, ActionType.TIME);

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.createTimeAction(request, "user1");

      // Then
      expect(result.isRequired).toBe(false);
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isRequired: false,
          maxSelections: 1,
        }),
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const request = {
        missionId: "mission1",
        title: "방문 가능한 시간을 선택해주세요",
        order: 0,
        maxSelections: 1,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createTimeAction(request, "user2"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "방문 가능한 시간을 선택해주세요",
        order: 0,
        maxSelections: 1,
        isRequired: true,
      };

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.createTimeAction(request, "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });

    it("maxSelections가 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "방문 가능한 시간을 선택해주세요",
        order: 0,
        isRequired: true,
      };

      // When & Then
      await expect(ctx.service.createTimeAction(request as never, "user1")).rejects.toThrow();

      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
    });
  });
});

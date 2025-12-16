import {
  actionUpdateSchema,
  eitherOrInputSchema,
  imageInputSchema,
  multipleChoiceInputSchema,
  ratingInputSchema,
  scaleInputSchema,
  subjectiveInputSchema,
  tagInputSchema,
} from "@/schemas/action";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { ActionType } from "@prisma/client";
import type {
  ActionCreatedResult,
  CreateEitherOrInput,
  CreateImageInput,
  CreateMultipleChoiceInput,
  CreateRatingInput,
  CreateScaleInput,
  CreateSubjectiveInput,
  CreateTagInput,
  GetActionsOptions,
  UpdateActionInput,
} from "./types";

export class ActionService {
  constructor(
    private actionRepo = actionRepository,
    private missionRepo = missionRepository,
  ) {}

  async getActionById(actionId: string) {
    const action = await this.actionRepo.findByIdWithOptions(actionId);

    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return action;
  }

  async getMissionActionIds(missionId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const actionIds = await this.actionRepo.findActionIdsByMissionId(missionId);

    return { actionIds };
  }

  async getMissionActionsDetail(missionId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const actions = await this.actionRepo.findDetailsByMissionId(missionId);

    return actions;
  }

  async getActions(options?: GetActionsOptions) {
    const limit = options?.limit ?? 10;
    const actions = await this.actionRepo.findMany({
      ...options,
      limit,
    });

    if (actions.length > limit) {
      actions.pop();
    }

    return actions;
  }

  async createMultipleChoiceAction(
    input: CreateMultipleChoiceInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    const result = multipleChoiceInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const action = await this.actionRepo.createMultipleChoice(
      {
        missionId: result.data.missionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        imageFileUploadId: result.data.imageFileUploadId,
        type: ActionType.MULTIPLE_CHOICE,
        order: result.data.order,
        maxSelections: result.data.maxSelections,
      },
      result.data.options.map(opt => ({
        title: opt.title,
        description: opt.description,
        imageUrl: opt.imageUrl,
        order: opt.order,
        imageFileUploadId: opt.imageFileUploadId,
      })),
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async createScaleAction(input: CreateScaleInput, userId: string): Promise<ActionCreatedResult> {
    const result = scaleInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const validated = result.data;
    const action = await this.actionRepo.createMultipleChoice(
      {
        missionId: validated.missionId,
        title: validated.title,
        description: validated.description,
        imageUrl: validated.imageUrl,
        imageFileUploadId: validated.imageFileUploadId,
        type: ActionType.SCALE,
        order: validated.order,
      },
      validated.options.map(opt => ({
        title: opt.title,
        description: opt.description,
        imageUrl: opt.imageUrl,
        order: opt.order,
        imageFileUploadId: opt.imageFileUploadId,
      })),
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async createSubjectiveAction(
    input: CreateSubjectiveInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    const result = subjectiveInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const action = await this.actionRepo.create(
      {
        missionId: result.data.missionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        imageFileUploadId: result.data.imageFileUploadId,
        type: ActionType.SUBJECTIVE,
        order: result.data.order,
      },
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async createEitherOrAction(
    input: CreateEitherOrInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    const result = eitherOrInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const action = await this.actionRepo.create(
      {
        missionId: result.data.missionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        imageFileUploadId: result.data.imageFileUploadId,
        type: ActionType.MULTIPLE_CHOICE,
        order: result.data.order,
      },
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async createTagAction(input: CreateTagInput, userId: string): Promise<ActionCreatedResult> {
    const result = tagInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const action = await this.actionRepo.createMultipleChoice(
      {
        missionId: result.data.missionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        imageFileUploadId: result.data.imageFileUploadId,
        type: ActionType.TAG,
        order: result.data.order,
        maxSelections: result.data.maxSelections ?? undefined,
      },
      result.data.options.map(opt => ({
        title: opt.title,
        description: opt.description,
        imageUrl: opt.imageUrl,
        order: opt.order,
        imageFileUploadId: opt.imageFileUploadId,
      })),
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async createRatingAction(input: CreateRatingInput, userId: string): Promise<ActionCreatedResult> {
    const result = ratingInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const action = await this.actionRepo.create(
      {
        missionId: result.data.missionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        imageFileUploadId: result.data.imageFileUploadId,
        type: ActionType.RATING,
        order: result.data.order,
      },
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async createImageAction(input: CreateImageInput, userId: string): Promise<ActionCreatedResult> {
    const result = imageInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    if (result.data.missionId) {
      await this.verifyMissionAccess(result.data.missionId, userId);
    }

    const action = await this.actionRepo.create(
      {
        missionId: result.data.missionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        imageFileUploadId: result.data.imageFileUploadId,
        type: ActionType.IMAGE,
        order: result.data.order,
      },
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      createdAt: action.createdAt,
    };
  }

  async updateAction(actionId: string, data: UpdateActionInput, userId: string) {
    const result = actionUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const action = await this.actionRepo.findById(actionId);
    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (action.missionId) {
      await this.verifyMissionAccess(action.missionId, userId);
    }

    const { options, ...actionData } = result.data;

    if (options && options.length > 0) {
      const updatedAction = await this.actionRepo.updateWithOptions(
        actionId,
        actionData,
        options,
        userId,
      );
      return updatedAction;
    }

    const updatedAction = await this.actionRepo.update(actionId, actionData, userId);

    return updatedAction;
  }

  async deleteAction(actionId: string, userId: string): Promise<void> {
    const action = await this.actionRepo.findById(actionId);
    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (action.missionId) {
      await this.verifyMissionAccess(action.missionId, userId);
    }

    await this.actionRepo.delete(actionId);
  }

  async reorderActions(
    missionId: string,
    actionOrders: Array<{ id: string; order: number }>,
    userId: string,
  ) {
    await this.verifyMissionAccess(missionId, userId);

    const actionIds = actionOrders.map(a => a.id);
    const missionActions = await this.actionRepo.findActionIdsByMissionId(missionId);

    const invalidActions = actionIds.filter(id => !missionActions.includes(id));
    if (invalidActions.length > 0) {
      const error = new Error("해당 미션에 속하지 않는 액션이 포함되어 있습니다.");
      error.cause = 400;
      throw error;
    }

    await this.actionRepo.updateManyOrders(actionOrders);

    return { success: true };
  }

  private async verifyMissionAccess(missionId: string, userId: string): Promise<void> {
    const mission = await this.missionRepo.findById(missionId);

    if (!mission) {
      const error = new Error("존재하지 않는 미션입니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("액션을 추가할 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }
  }
}

export const actionService = new ActionService();

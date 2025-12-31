import {
  actionUpdateSchema,
  dateInputSchema,
  eitherOrInputSchema,
  imageInputSchema,
  multipleChoiceInputSchema,
  pdfInputSchema,
  privacyConsentInputSchema,
  ratingInputSchema,
  scaleInputSchema,
  subjectiveInputSchema,
  tagInputSchema,
  timeInputSchema,
  videoInputSchema,
} from "@/schemas/action";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { ActionType } from "@prisma/client";
import { z } from "zod";
import type {
  ActionCreatedResult,
  CreateDateInput,
  CreateEitherOrInput,
  CreateImageInput,
  CreateMultipleChoiceInput,
  CreatePdfInput,
  CreatePrivacyConsentInput,
  CreateRatingInput,
  CreateScaleInput,
  CreateSubjectiveInput,
  CreateTagInput,
  CreateTimeInput,
  CreateVideoInput,
  GetActionsOptions,
  UpdateActionInput,
} from "./types";

export class ActionService {
  constructor(
    private actionRepo = actionRepository,
    private missionRepo = missionRepository,
  ) {}

  private async createSimpleAction<T>(
    input: T,
    schema: z.ZodType<T>,
    type: ActionType,
    userId: string,
    maxSelections?: number,
  ): Promise<ActionCreatedResult> {
    const result = schema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const validated = result.data as {
      missionId?: string;
      title: string;
      description?: string;
      imageUrl?: string;
      imageFileUploadId?: string;
      order: number;
      isRequired?: boolean;
    };

    if (validated.missionId) {
      await this.verifyMissionAccess(validated.missionId, userId);
    }

    const action = await this.actionRepo.create(
      {
        missionId: validated.missionId,
        title: validated.title,
        description: validated.description,
        imageUrl: validated.imageUrl,
        imageFileUploadId: validated.imageFileUploadId,
        type,
        order: validated.order,
        maxSelections,
        isRequired: validated.isRequired,
      },
      userId,
    );

    return {
      id: action.id,
      missionId: action.missionId || "",
      title: action.title,
      type: action.type,
      order: action.order,
      isRequired: action.isRequired,
      createdAt: action.createdAt,
    };
  }

  private async createActionWithOptions<T>(
    input: T,
    schema: z.ZodType<T>,
    type: ActionType,
    userId: string,
    maxSelections?: number,
  ): Promise<ActionCreatedResult> {
    const result = schema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const validated = result.data as {
      missionId?: string;
      title: string;
      description?: string;
      imageUrl?: string;
      imageFileUploadId?: string;
      order: number;
      isRequired?: boolean;
      options: Array<{
        title: string;
        description?: string;
        imageUrl?: string;
        order: number;
        imageFileUploadId?: string;
      }>;
    };

    if (validated.missionId) {
      await this.verifyMissionAccess(validated.missionId, userId);
    }

    const action = await this.actionRepo.createMultipleChoice(
      {
        missionId: validated.missionId,
        title: validated.title,
        description: validated.description,
        imageUrl: validated.imageUrl,
        imageFileUploadId: validated.imageFileUploadId,
        type,
        order: validated.order,
        maxSelections,
        isRequired: validated.isRequired,
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
      isRequired: action.isRequired,
      createdAt: action.createdAt,
    };
  }

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
    return this.createActionWithOptions(
      input,
      multipleChoiceInputSchema,
      ActionType.MULTIPLE_CHOICE,
      userId,
      (input as { maxSelections: number }).maxSelections,
    );
  }

  async createScaleAction(input: CreateScaleInput, userId: string): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(input, scaleInputSchema, ActionType.SCALE, userId);
  }

  async createSubjectiveAction(
    input: CreateSubjectiveInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, subjectiveInputSchema, ActionType.SUBJECTIVE, userId);
  }

  async createEitherOrAction(
    input: CreateEitherOrInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, eitherOrInputSchema, ActionType.MULTIPLE_CHOICE, userId);
  }

  async createTagAction(input: CreateTagInput, userId: string): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(
      input,
      tagInputSchema,
      ActionType.TAG,
      userId,
      (input as { maxSelections?: number }).maxSelections,
    );
  }

  async createRatingAction(input: CreateRatingInput, userId: string): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, ratingInputSchema, ActionType.RATING, userId);
  }

  async createImageAction(input: CreateImageInput, userId: string): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, imageInputSchema, ActionType.IMAGE, userId);
  }

  async createPdfAction(input: CreatePdfInput, userId: string): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, pdfInputSchema, ActionType.PDF, userId);
  }

  async createVideoAction(input: CreateVideoInput, userId: string): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, videoInputSchema, ActionType.VIDEO, userId);
  }

  async createPrivacyConsentAction(
    input: CreatePrivacyConsentInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      privacyConsentInputSchema,
      ActionType.PRIVACY_CONSENT,
      userId,
    );
  }

  async createDateAction(input: CreateDateInput, userId: string): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      dateInputSchema,
      ActionType.DATE,
      userId,
      input.maxSelections,
    );
  }

  async createTimeAction(input: CreateTimeInput, userId: string): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      timeInputSchema,
      ActionType.TIME,
      userId,
      input.maxSelections,
    );
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

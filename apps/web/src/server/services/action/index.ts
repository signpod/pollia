import { logger } from "@/lib/logger";
import {
  actionUpdateSchema,
  branchInputSchema,
  dateInputSchema,
  eitherOrInputSchema,
  imageInputSchema,
  multipleChoiceInputSchema,
  pdfInputSchema,
  ratingInputSchema,
  scaleInputSchema,
  shortTextInputSchema,
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
  BaseActionInput,
  BaseActionInputWithOptions,
  CreateBranchInput,
  CreateDateInput,
  CreateEitherOrInput,
  CreateImageInput,
  CreateMultipleChoiceInput,
  CreatePdfInput,
  CreateRatingInput,
  CreateScaleInput,
  CreateShortTextInput,
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

  private async createSimpleAction<T extends BaseActionInput>(
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

    const validated = result.data;

    if (validated.missionId) {
      await this.verifyMissionAccess(validated.missionId, userId);
    }

    const action = await this.actionRepo.create(
      {
        ...validated,
        type,
        maxSelections: maxSelections ?? validated.maxSelections,
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
      nextActionId: action.nextActionId,
      nextCompletionId: action.nextCompletionId,
    };
  }

  private async createActionWithOptions<T extends BaseActionInputWithOptions>(
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

    const validated = result.data;

    if (validated.missionId) {
      await this.verifyMissionAccess(validated.missionId, userId);
    }

    const { options, ...actionData } = validated;

    const action = await this.actionRepo.createMultipleChoice(
      {
        ...actionData,
        type,
        maxSelections,
      },
      options.map(opt => ({
        title: opt.title,
        description: opt.description ?? undefined,
        imageUrl: opt.imageUrl ?? undefined,
        order: opt.order,
        imageFileUploadId: opt.imageFileUploadId ?? undefined,
        nextActionId: opt.nextActionId ?? null,
        nextCompletionId: opt.nextCompletionId ?? null,
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
      nextActionId: action.nextActionId,
      nextCompletionId: action.nextCompletionId,
    };
  }

  async getActionById(actionId: string) {
    const action = await this.actionRepo.findByIdWithOptions(actionId);

    if (!action) {
      this.throwActionNotFound();
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
      input.maxSelections,
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

  async createShortTextAction(
    input: CreateShortTextInput,
    userId: string,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(input, shortTextInputSchema, ActionType.SHORT_TEXT, userId);
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
      input.maxSelections,
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

  async createBranchAction(input: CreateBranchInput, userId: string): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(input, branchInputSchema, ActionType.BRANCH, userId, 1);
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
      this.throwActionNotFound();
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
      this.throwActionNotFound();
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

  async duplicateAction(
    actionId: string,
    missionId: string,
    userId: string,
  ): Promise<ActionCreatedResult> {
    await this.verifyMissionAccess(missionId, userId);

    const original = await this.actionRepo.findByIdWithOptions(actionId);
    if (!original) {
      this.throwActionNotFound();
    }

    if (original.missionId !== missionId) {
      const error = new Error("해당 미션에 속하지 않는 액션입니다.");
      error.cause = 400;
      throw error;
    }

    const existingActionIds = await this.actionRepo.findActionIdsByMissionId(missionId);
    const nextOrder = existingActionIds.length;

    const duplicatedTitle = `${original.title} (복사본)`;

    const actionData = {
      missionId,
      title: duplicatedTitle,
      description: original.description,
      imageUrl: original.imageUrl,
      type: original.type,
      order: nextOrder,
      maxSelections: original.maxSelections,
      isRequired: original.isRequired,
      hasOther: original.hasOther,
      nextActionId: null,
      nextCompletionId: null,
    };

    const createdAction =
      original.options.length > 0
        ? await this.actionRepo.createMultipleChoice(
            actionData,
            original.options.map((opt, index) => ({
              title: opt.title,
              description: opt.description ?? undefined,
              imageUrl: opt.imageUrl ?? undefined,
              order: index,
              nextActionId: null,
              nextCompletionId: null,
            })),
            userId,
          )
        : await this.actionRepo.create(actionData, userId);

    return {
      id: createdAction.id,
      missionId: createdAction.missionId || "",
      title: createdAction.title,
      type: createdAction.type,
      order: createdAction.order,
      isRequired: createdAction.isRequired,
      createdAt: createdAction.createdAt,
      nextActionId: createdAction.nextActionId,
      nextCompletionId: createdAction.nextCompletionId,
    };
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

  private throwActionNotFound(): never {
    const error = new Error("액션을 찾을 수 없습니다.");
    error.cause = 404;
    throw error;
  }

  async calculateReachableActionIds(missionId: string): Promise<string[]> {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission?.entryActionId) {
      return [];
    }

    const actions = await this.actionRepo.findDetailsByMissionId(missionId);
    const actionMap = new Map(actions.map(a => [a.id, a]));

    const reachable = new Set<string>();
    const queue: string[] = [mission.entryActionId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) break;

      if (reachable.has(currentId)) continue;

      reachable.add(currentId);
      const action = actionMap.get(currentId);
      if (!action) continue;

      if (action.nextActionId) {
        queue.push(action.nextActionId);
      }

      for (const option of action.options) {
        if (option.nextActionId) {
          queue.push(option.nextActionId);
        }
      }
    }

    return Array.from(reachable);
  }

  async disconnectActionWithCleanup(actionId: string, missionId: string, userId: string) {
    try {
      const action = await this.actionRepo.findById(actionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId);
      }

      await this.actionRepo.update(
        actionId,
        {
          nextActionId: null,
          nextCompletionId: null,
        },
        userId,
      );

      const reachableIds = await this.calculateReachableActionIds(missionId);
      const allActions = await this.actionRepo.findDetailsByMissionId(missionId);

      for (const currentAction of allActions) {
        if (reachableIds.includes(currentAction.id)) continue;

        await this.actionRepo.update(currentAction.id, {
          nextActionId: null,
          nextCompletionId: null,
        });

        const hasOptionConnection = currentAction.options.some(
          opt => opt.nextActionId || opt.nextCompletionId,
        );

        if (hasOptionConnection) {
          const cleanedOptions = currentAction.options.map(opt => ({
            ...opt,
            nextActionId: null,
            nextCompletionId: null,
          }));

          await this.actionRepo.updateWithOptions(currentAction.id, {}, cleanedOptions, userId);
        }
      }
    } catch (error) {
      logger.error("액션 연결 해제 실패", {
        actionId,
        missionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async disconnectBranchOptionWithCleanup(
    actionId: string,
    optionId: string,
    missionId: string,
    userId: string,
  ) {
    try {
      const action = await this.actionRepo.findByIdWithOptions(actionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId);
      }

      const updatedOptions = action.options.map(opt =>
        opt.id === optionId
          ? {
              ...opt,
              nextActionId: null,
              nextCompletionId: null,
            }
          : opt,
      );

      await this.actionRepo.updateWithOptions(actionId, {}, updatedOptions, userId);

      const reachableIds = await this.calculateReachableActionIds(missionId);
      const allActions = await this.actionRepo.findDetailsByMissionId(missionId);

      for (const currentAction of allActions) {
        if (reachableIds.includes(currentAction.id)) continue;

        await this.actionRepo.update(currentAction.id, {
          nextActionId: null,
          nextCompletionId: null,
        });

        const hasOptionConnection = currentAction.options.some(
          opt => opt.nextActionId || opt.nextCompletionId,
        );

        if (hasOptionConnection) {
          const cleanedOptions = currentAction.options.map(opt => ({
            ...opt,
            nextActionId: null,
            nextCompletionId: null,
          }));

          await this.actionRepo.updateWithOptions(currentAction.id, {}, cleanedOptions, userId);
        }
      }
    } catch (error) {
      logger.error("브랜치 옵션 연결 해제 실패", {
        actionId,
        optionId,
        missionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async connectAction(
    sourceActionId: string,
    targetId: string,
    isCompletion: boolean,
    _missionId: string,
    userId: string,
  ) {
    try {
      const action = await this.actionRepo.findById(sourceActionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId);
      }

      await this.actionRepo.update(
        sourceActionId,
        {
          nextActionId: isCompletion ? null : targetId,
          nextCompletionId: isCompletion ? targetId : null,
        },
        userId,
      );
    } catch (error) {
      logger.error("액션 연결 실패", {
        sourceActionId,
        targetId,
        isCompletion,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async connectBranchOption(
    actionId: string,
    optionId: string,
    targetId: string,
    isCompletion: boolean,
    _missionId: string,
    userId: string,
  ) {
    try {
      const action = await this.actionRepo.findByIdWithOptions(actionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId);
      }

      const updatedOptions = action.options.map(opt =>
        opt.id === optionId
          ? {
              ...opt,
              nextActionId: isCompletion ? null : targetId,
              nextCompletionId: isCompletion ? targetId : null,
            }
          : opt,
      );

      await this.actionRepo.updateWithOptions(actionId, {}, updatedOptions, userId);
    } catch (error) {
      logger.error("브랜치 옵션 연결 실패", {
        actionId,
        optionId,
        targetId,
        isCompletion,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

export const actionService = new ActionService();

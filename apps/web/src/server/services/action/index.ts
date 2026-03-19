import prisma from "@/database/utils/prisma/client";
import { logger } from "@/lib/logger";
import {
  actionUpdateSchema,
  branchInputSchema,
  dateInputSchema,
  eitherOrInputSchema,
  imageInputSchema,
  multipleChoiceInputSchema,
  oxInputSchema,
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
import { missionCompletionRepository } from "@/server/repositories/mission-completion/missionCompletionRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { type Action, ActionType, Prisma } from "@prisma/client";
import { z } from "zod";
import { actionSectionDraftSnapshotSchema } from "./actionSectionDraftSchema";
import type {
  ActionCreatedResult,
  ActionToCreate,
  ActionToUpdate,
  BaseActionInput,
  BaseActionInputWithOptions,
  CreateBranchInput,
  CreateDateInput,
  CreateEitherOrInput,
  CreateImageInput,
  CreateMultipleChoiceInput,
  CreateOXInput,
  CreatePdfInput,
  CreateRatingInput,
  CreateScaleInput,
  CreateShortTextInput,
  CreateSubjectiveInput,
  CreateTagInput,
  CreateTimeInput,
  CreateVideoInput,
  GetActionsOptions,
  SaveActionSectionInput,
  SaveActionSectionResult,
  UpdateActionInput,
} from "./types";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
} as const;

const VALIDATION_FAILED_MESSAGE = "유효성 검사 실패";
const DUPLICATE_TITLE_SUFFIX = " (복사본)";
const EXISTING_ITEM_PREFIX = "existing:";

export class ActionService {
  constructor(
    private actionRepo = actionRepository,
    private missionRepo = missionRepository,
    private completionRepo = missionCompletionRepository,
  ) {}

  private async createSimpleAction<T extends BaseActionInput>(
    input: T,
    schema: z.ZodType<T>,
    type: ActionType,
    userId: string,
    maxSelections?: number,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    const result = schema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || VALIDATION_FAILED_MESSAGE);
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const validated = result.data;

    if (validated.missionId) {
      await this.verifyMissionAccess(validated.missionId, userId, isAdmin);
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
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    const result = schema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || VALIDATION_FAILED_MESSAGE);
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const validated = result.data;

    if (validated.missionId) {
      await this.verifyMissionAccess(validated.missionId, userId, isAdmin);
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
        isCorrect: opt.isCorrect ?? false,
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
    await this.getMissionOrThrow(missionId);

    const actionIds = await this.actionRepo.findActionIdsByMissionId(missionId);

    return { actionIds };
  }

  async getMissionActionsDetail(missionId: string) {
    await this.getMissionOrThrow(missionId);

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
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(
      input,
      multipleChoiceInputSchema,
      ActionType.MULTIPLE_CHOICE,
      userId,
      input.maxSelections,
      isAdmin,
    );
  }

  async createScaleAction(
    input: CreateScaleInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(
      input,
      scaleInputSchema,
      ActionType.SCALE,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createSubjectiveAction(
    input: CreateSubjectiveInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      subjectiveInputSchema,
      ActionType.SUBJECTIVE,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createShortTextAction(
    input: CreateShortTextInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    if (input.options && input.options.length > 0) {
      return this.createActionWithOptions(
        input as CreateShortTextInput & { options: NonNullable<CreateShortTextInput["options"]> },
        shortTextInputSchema as z.ZodType<
          CreateShortTextInput & { options: NonNullable<CreateShortTextInput["options"]> }
        >,
        ActionType.SHORT_TEXT,
        userId,
        undefined,
        isAdmin,
      );
    }
    return this.createSimpleAction(
      input,
      shortTextInputSchema as z.ZodType<CreateShortTextInput>,
      ActionType.SHORT_TEXT,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createEitherOrAction(
    input: CreateEitherOrInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      eitherOrInputSchema,
      ActionType.MULTIPLE_CHOICE,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createTagAction(
    input: CreateTagInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(
      input,
      tagInputSchema,
      ActionType.TAG,
      userId,
      input.maxSelections,
      isAdmin,
    );
  }

  async createRatingAction(
    input: CreateRatingInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      ratingInputSchema,
      ActionType.RATING,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createImageAction(
    input: CreateImageInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      imageInputSchema,
      ActionType.IMAGE,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createPdfAction(
    input: CreatePdfInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      pdfInputSchema,
      ActionType.PDF,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createVideoAction(
    input: CreateVideoInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      videoInputSchema,
      ActionType.VIDEO,
      userId,
      undefined,
      isAdmin,
    );
  }

  async createDateAction(
    input: CreateDateInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      dateInputSchema,
      ActionType.DATE,
      userId,
      input.maxSelections,
      isAdmin,
    );
  }

  async createTimeAction(
    input: CreateTimeInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createSimpleAction(
      input,
      timeInputSchema,
      ActionType.TIME,
      userId,
      input.maxSelections,
      isAdmin,
    );
  }

  async createOXAction(
    input: CreateOXInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(input, oxInputSchema, ActionType.OX, userId, 1, isAdmin);
  }

  async createBranchAction(
    input: CreateBranchInput,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    return this.createActionWithOptions(
      input,
      branchInputSchema,
      ActionType.BRANCH,
      userId,
      1,
      isAdmin,
    );
  }

  async updateAction(actionId: string, data: UpdateActionInput, userId: string, isAdmin = false) {
    const result = actionUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || VALIDATION_FAILED_MESSAGE);
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const action = await this.actionRepo.findById(actionId);
    if (!action) {
      this.throwActionNotFound();
    }

    if (action.missionId) {
      await this.verifyMissionAccess(action.missionId, userId, isAdmin);
    }

    const { options, type, ...restActionData } = result.data;
    const nextType = type ?? action.type;
    const isTypeChanged = type !== undefined && type !== action.type;

    if (isTypeChanged && this.isOptionBasedActionType(nextType) && options === undefined) {
      const error = new Error("해당 액션 유형은 옵션을 포함해야 합니다.");
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    if (isTypeChanged && nextType === ActionType.BRANCH && options?.length !== 2) {
      const error = new Error("분기 액션은 정확히 2개의 옵션이 필요합니다.");
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const actionData = {
      ...restActionData,
      ...(type !== undefined && { type }),
    };

    if (options !== undefined) {
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

  private isOptionBasedActionType(type: ActionType): boolean {
    return (
      type === ActionType.MULTIPLE_CHOICE ||
      type === ActionType.SCALE ||
      type === ActionType.TAG ||
      type === ActionType.BRANCH ||
      type === ActionType.OX
    );
  }

  async deleteAction(actionId: string, userId: string, isAdmin = false): Promise<void> {
    const action = await this.actionRepo.findById(actionId);
    if (!action) {
      this.throwActionNotFound();
    }

    if (action.missionId) {
      await this.verifyMissionAccess(action.missionId, userId, isAdmin);
      await this.deleteAndReindexOrders(actionId, action.missionId);
      return;
    }

    await this.actionRepo.delete(actionId);
  }

  private async deleteAndReindexOrders(actionId: string, missionId: string): Promise<void> {
    await prisma.$transaction(async tx => {
      await this.actionRepo.delete(actionId, tx);

      const remaining = await this.actionRepo.findOrdersByMissionId(missionId, tx);

      remaining.sort((a, b) => {
        const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;

        const aCreated = a.createdAt.getTime();
        const bCreated = b.createdAt.getTime();
        if (aCreated !== bCreated) return aCreated - bCreated;

        return a.id.localeCompare(b.id);
      });

      await Promise.all(
        remaining.flatMap((action, index) =>
          action.order === index ? [] : [this.actionRepo.updateOrder(action.id, index, tx)],
        ),
      );
    });
  }

  async reorderActions(
    missionId: string,
    actionOrders: Array<{ id: string; order: number }>,
    userId: string,
    isAdmin = false,
  ) {
    await this.verifyMissionAccess(missionId, userId, isAdmin);

    const actionIds = actionOrders.map(a => a.id);
    const missionActions = await this.actionRepo.findActionIdsByMissionId(missionId);

    const invalidActions = actionIds.filter(id => !missionActions.includes(id));
    if (invalidActions.length > 0) {
      const error = new Error("해당 미션에 속하지 않는 액션이 포함되어 있습니다.");
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    await this.actionRepo.updateManyOrders(actionOrders);

    return { success: true };
  }

  async duplicateAction(
    actionId: string,
    missionId: string,
    userId: string,
    isAdmin = false,
  ): Promise<ActionCreatedResult> {
    await this.verifyMissionAccess(missionId, userId, isAdmin);

    const original = await this.actionRepo.findByIdWithOptions(actionId);
    if (!original) {
      this.throwActionNotFound();
    }

    if (original.missionId !== missionId) {
      const error = new Error("해당 미션에 속하지 않는 액션입니다.");
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const existingActionIds = await this.actionRepo.findActionIdsByMissionId(missionId);
    const nextOrder = existingActionIds.length;

    const duplicatedTitle = `${original.title}${DUPLICATE_TITLE_SUFFIX}`;

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
      score: original.score,
      matchMode: original.matchMode,
      hint: original.hint,
      explanation: original.explanation,
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
              isCorrect: opt.isCorrect,
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

  private async getMissionOrThrow(missionId: string) {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) {
      const error = new Error("존재하지 않는 미션입니다.");
      error.cause = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return mission;
  }

  private async verifyMissionAccess(
    missionId: string,
    userId: string,
    isAdmin = false,
  ): Promise<void> {
    const mission = await this.getMissionOrThrow(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
      const error = new Error("액션을 추가할 권한이 없습니다.");
      error.cause = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
  }

  private throwActionNotFound(): never {
    const error = new Error("액션을 찾을 수 없습니다.");
    error.cause = HTTP_STATUS.NOT_FOUND;
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

  async disconnectActionWithCleanup(
    actionId: string,
    missionId: string,
    userId: string,
    isAdmin = false,
  ) {
    try {
      const action = await this.actionRepo.findById(actionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId, isAdmin);
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
    isAdmin = false,
  ) {
    try {
      const action = await this.actionRepo.findByIdWithOptions(actionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId, isAdmin);
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
    isAdmin = false,
  ) {
    try {
      const action = await this.actionRepo.findById(sourceActionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId, isAdmin);
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
    isAdmin = false,
  ) {
    try {
      const action = await this.actionRepo.findByIdWithOptions(actionId);
      if (!action) {
        this.throwActionNotFound();
      }

      if (action.missionId) {
        await this.verifyMissionAccess(action.missionId, userId, isAdmin);
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
  async saveActionSection(
    input: SaveActionSectionInput,
    userId: string,
    isAdmin = false,
  ): Promise<SaveActionSectionResult> {
    await this.verifyMissionAccess(input.missionId, userId, isAdmin);

    const tempToRealActionIdMap = new Map<string, string>();
    const tempToRealCompletionIdMap = new Map<string, string>();
    const createdActionIds: string[] = [];
    const updatedActionIds: string[] = [];
    const createdCompletionIds: string[] = [];

    await prisma.$transaction(async tx => {
      for (const comp of input.completionsToCreate) {
        const created = await this.completionRepo.create(
          {
            missionId: input.missionId,
            title: comp.title,
            description: comp.description,
            imageUrl: comp.imageUrl ?? undefined,
            imageFileUploadId: comp.imageFileUploadId ?? undefined,
          },
          userId,
          tx,
        );
        tempToRealCompletionIdMap.set(comp.tempId, created.id);
        createdCompletionIds.push(created.id);
      }

      for (const action of input.actionsToCreate) {
        const { values, actionType, tempId } = action;
        const hasOptions =
          (this.isOptionBasedActionType(actionType) || actionType === ActionType.SHORT_TEXT) &&
          values.options &&
          values.options.length > 0;

        const actionData = {
          missionId: input.missionId,
          title: values.title,
          description: values.description ?? null,
          imageUrl: values.imageUrl ?? null,
          imageFileUploadId: values.imageFileUploadId ?? null,
          isRequired: values.isRequired,
          hasOther: values.hasOther ?? false,
          maxSelections: values.maxSelections ?? null,
          type: actionType,
          order: 0,
          nextActionId: null,
          nextCompletionId: null,
          score: values.score ?? null,
          matchMode: values.matchMode ?? null,
          hint: values.hint ?? null,
          explanation: values.explanation ?? null,
        };

        let created: Action;
        if (hasOptions && values.options) {
          created = await this.actionRepo.createMultipleChoice(
            actionData,
            values.options.map(opt => ({
              title: opt.title,
              description: opt.description ?? null,
              imageUrl: opt.imageUrl ?? null,
              order: opt.order,
              isCorrect: opt.isCorrect ?? false,
              fileUploadId: opt.fileUploadId ?? null,
              nextActionId: null,
              nextCompletionId: null,
            })),
            userId,
            tx,
          );
        } else {
          created = await this.actionRepo.create(actionData, userId, tx);
        }

        tempToRealActionIdMap.set(tempId, created.id);
        createdActionIds.push(created.id);
      }

      const resolveActionId = (id: string | null | undefined): string | null => {
        if (!id) return null;
        const resolved = tempToRealActionIdMap.get(id);
        if (resolved) return resolved;
        if (id.startsWith("draft:")) return null;
        return id;
      };

      const resolveCompletionId = (id: string | null | undefined): string | null => {
        if (!id) return null;
        const resolved = tempToRealCompletionIdMap.get(id);
        if (resolved) return resolved;
        if (id.startsWith("draft:")) return null;
        return id;
      };

      for (const action of input.actionsToCreate) {
        const realId = tempToRealActionIdMap.get(action.tempId);
        if (!realId) continue;

        const { values } = action;
        const resolvedNextActionId = resolveActionId(values.nextActionId);
        const resolvedNextCompletionId = resolveCompletionId(values.nextCompletionId);

        const hasOptionFkRefs = values.options?.some(
          opt => opt.nextActionId || opt.nextCompletionId,
        );

        const needsActionLevelUpdate =
          resolvedNextActionId !== null || resolvedNextCompletionId !== null;

        if (needsActionLevelUpdate && !hasOptionFkRefs) {
          await this.actionRepo.update(
            realId,
            {
              nextActionId: resolvedNextActionId,
              nextCompletionId: resolvedNextCompletionId,
            },
            userId,
            tx,
          );
        }

        if (hasOptionFkRefs && values.options) {
          const resolvedOptions = values.options.map(opt => ({
            id: opt.id,
            title: opt.title,
            description: opt.description ?? null,
            imageUrl: opt.imageUrl ?? null,
            order: opt.order,
            isCorrect: opt.isCorrect ?? false,
            fileUploadId: opt.fileUploadId ?? null,
            nextActionId: resolveActionId(opt.nextActionId) ?? null,
            nextCompletionId: resolveCompletionId(opt.nextCompletionId) ?? null,
          }));
          await this.actionRepo.updateWithOptions(
            realId,
            {
              nextActionId: resolvedNextActionId,
              nextCompletionId: resolvedNextCompletionId,
            },
            resolvedOptions,
            userId,
            tx,
          );
        }
      }

      for (const action of input.actionsToUpdate) {
        const { values, actionType } = action;
        const hasOptions =
          (this.isOptionBasedActionType(actionType) || actionType === ActionType.SHORT_TEXT) &&
          values.options &&
          values.options.length > 0;

        const updateData = {
          title: values.title,
          description: values.description ?? null,
          imageUrl: values.imageUrl ?? null,
          imageFileUploadId: values.imageFileUploadId ?? null,
          isRequired: values.isRequired,
          hasOther: values.hasOther ?? false,
          maxSelections: values.maxSelections ?? null,
          type: actionType,
          nextActionId: resolveActionId(values.nextActionId),
          nextCompletionId: resolveCompletionId(values.nextCompletionId),
          score: values.score ?? null,
          matchMode: values.matchMode ?? null,
          hint: values.hint ?? null,
          explanation: values.explanation ?? null,
        };

        if (hasOptions && values.options) {
          const resolvedOptions = values.options.map(opt => ({
            id: opt.id,
            title: opt.title,
            description: opt.description ?? null,
            imageUrl: opt.imageUrl ?? null,
            order: opt.order,
            isCorrect: opt.isCorrect ?? false,
            fileUploadId: opt.fileUploadId ?? null,
            nextActionId: resolveActionId(opt.nextActionId) ?? null,
            nextCompletionId: resolveCompletionId(opt.nextCompletionId) ?? null,
          }));
          await this.actionRepo.updateWithOptions(
            action.actionId,
            updateData,
            resolvedOptions,
            userId,
            tx,
          );
        } else {
          await this.actionRepo.update(action.actionId, updateData, userId, tx);
        }

        updatedActionIds.push(action.actionId);
      }

      for (let i = 0; i < input.actionOrder.length; i++) {
        const key = input.actionOrder[i]!;
        const realId = resolveActionId(key) ?? key;
        if (realId.startsWith("draft:")) continue;
        await this.actionRepo.updateOrder(realId, i, tx);
      }

      const resolvedEntryActionId = input.entryActionKey
        ? resolveActionId(input.entryActionKey)
        : null;

      await this.missionRepo.update(
        input.missionId,
        { entryActionId: resolvedEntryActionId },
        userId,
        tx,
      );
    });

    return {
      createdActionIds,
      updatedActionIds,
      createdCompletionIds,
      tempToRealActionIdMap: Object.fromEntries(tempToRealActionIdMap),
      tempToRealCompletionIdMap: Object.fromEntries(tempToRealCompletionIdMap),
    };
  }

  async applyActionSectionDraft(
    missionId: string,
    userId: string,
    isAdmin = false,
  ): Promise<SaveActionSectionResult> {
    const mission = await this.getMissionOrThrow(missionId);

    if (!isAdmin && mission.creatorId !== userId) {
      const error = new Error("액션을 추가할 권한이 없습니다.");
      error.cause = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    if (!mission.editorDraft) {
      const error = new Error("적용할 draft가 없습니다.");
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const draft = mission.editorDraft as Record<string, unknown>;
    const actionSection = draft.action ?? null;

    if (!actionSection) {
      return {
        createdActionIds: [],
        updatedActionIds: [],
        createdCompletionIds: [],
        tempToRealActionIdMap: {},
        tempToRealCompletionIdMap: {},
      };
    }

    const actionParseResult = actionSectionDraftSnapshotSchema.safeParse(actionSection);
    if (!actionParseResult.success) {
      const error = new Error("action draft 파싱에 실패했습니다.");
      error.cause = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const actionDraft = actionParseResult.data;

    const actionsToCreate: ActionToCreate[] = [];
    const actionsToUpdate: ActionToUpdate[] = [];

    for (const key of actionDraft.itemOrderKeys ?? Object.keys(actionDraft.formSnapshotByItemKey)) {
      const isDraftItem = key.startsWith("draft:");
      const isExistingItem = key.startsWith(EXISTING_ITEM_PREFIX);

      if (isDraftItem) {
        const snapshot = actionDraft.formSnapshotByItemKey[key];
        if (!snapshot) continue;

        actionsToCreate.push({
          tempId: key,
          actionType: snapshot.actionType,
          values: snapshot.values,
        });
      } else if (isExistingItem) {
        const isDirty = actionDraft.dirtyByItemKey[key] === true;
        if (!isDirty) continue;

        const actionId = key.replace(EXISTING_ITEM_PREFIX, "");
        const snapshot = actionDraft.formSnapshotByItemKey[key];
        if (!snapshot) continue;

        actionsToUpdate.push({
          actionId,
          actionType: snapshot.actionType,
          values: snapshot.values,
        });
      }
    }

    const actionOrder = (actionDraft.itemOrderKeys ?? []).map(key => {
      if (key.startsWith(EXISTING_ITEM_PREFIX)) {
        return key.replace(EXISTING_ITEM_PREFIX, "");
      }
      return key;
    });

    const entryActionKey = actionOrder.length > 0 ? actionOrder[0]! : null;

    const result = await this.saveActionSection(
      {
        missionId,
        completionsToCreate: [],
        actionsToCreate,
        actionsToUpdate,
        actionOrder,
        entryActionKey,
      },
      userId,
      isAdmin,
    );

    const clearedDraft = {
      ...draft,
      action: null,
      completion: null,
    };

    await this.missionRepo.update(
      missionId,
      { editorDraft: clearedDraft as Prisma.InputJsonValue },
      userId,
    );

    return result;
  }
}

export const actionService = new ActionService();

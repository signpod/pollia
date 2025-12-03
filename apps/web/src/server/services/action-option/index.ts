import {
  optionInputSchema,
  optionUpdateSchema,
  optionsInputSchema,
} from "@/schemas/survey-question-option";
import { actionOptionRepository } from "@/server/repositories/action-option/actionOptionRepository";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import type { ActionOption } from "@prisma/client";

export class ActionOptionService {
  constructor(
    private optionRepo = actionOptionRepository,
    private actionRepo = actionRepository,
    private missionRepo = missionRepository,
  ) {}

  async getOptionById(optionId: string): Promise<ActionOption> {
    const option = await this.optionRepo.findById(optionId);

    if (!option) {
      const error = new Error("옵션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return option;
  }

  async getOptionsByActionId(actionId: string): Promise<ActionOption[]> {
    const action = await this.actionRepo.findById(actionId);
    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const options = await this.optionRepo.findByActionId(actionId);
    return options;
  }

  async createOption(
    data: {
      questionId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      fileUploadId?: string;
    },
    userId: string,
  ): Promise<ActionOption> {
    const result = optionInputSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const actionId = result.data.questionId;

    await this.verifyActionAccess(actionId, userId);

    const option = await this.optionRepo.create(
      {
        actionId,
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl,
        order: result.data.order,
        fileUploadId: result.data.fileUploadId,
      },
      userId,
    );
    return option;
  }

  async createOptions(
    questionId: string,
    options: Array<{
      title: string;
      description?: string;
      imageUrl?: string;
      order: number;
      fileUploadId?: string;
    }>,
    userId: string,
  ): Promise<ActionOption[]> {
    const result = optionsInputSchema.safeParse({ questionId, options });
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const actionId = result.data.questionId;

    await this.verifyActionAccess(actionId, userId);

    const createdOptions = await this.optionRepo.createMany(actionId, result.data.options, userId);
    return createdOptions;
  }

  async updateOption(
    optionId: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      order?: number;
    },
    userId: string,
  ): Promise<ActionOption> {
    const result = optionUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const option = await this.getOptionById(optionId);

    await this.verifyActionAccess(option.actionId, userId);

    const updatedOption = await this.optionRepo.update(optionId, result.data);
    return updatedOption;
  }

  async deleteOption(optionId: string, userId: string): Promise<void> {
    const option = await this.getOptionById(optionId);

    await this.verifyActionAccess(option.actionId, userId);

    await this.optionRepo.delete(optionId);
  }

  async deleteOptionsByActionId(actionId: string, userId: string): Promise<void> {
    await this.verifyActionAccess(actionId, userId);

    await this.optionRepo.deleteByActionId(actionId);
  }

  private async verifyActionAccess(actionId: string, userId: string): Promise<void> {
    const action = await this.actionRepo.findById(actionId);

    if (!action) {
      const error = new Error("존재하지 않는 액션입니다.");
      error.cause = 404;
      throw error;
    }

    if (action.missionId) {
      const mission = await this.missionRepo.findById(action.missionId);

      if (!mission) {
        const error = new Error("존재하지 않는 미션입니다.");
        error.cause = 404;
        throw error;
      }

      if (mission.creatorId !== userId) {
        const error = new Error("옵션을 수정할 권한이 없습니다.");
        error.cause = 403;
        throw error;
      }
    }
  }
}

export const actionOptionService = new ActionOptionService();

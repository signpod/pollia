"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionOptionService } from "@/server/services/action-option";
import type { ActionOption } from "@prisma/client";

export async function updateOption(
  optionId: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    order?: number;
    imageFileUploadId?: string;
  },
): Promise<{ data: ActionOption }> {
  try {
    const user = await requireActiveUser();

    const updatedOption = await actionOptionService.updateOption(optionId, data, user.id);

    return { data: updatedOption };
  } catch (error) {
    return handleActionError(error, "옵션 수정 중 오류가 발생했습니다.");
  }
}

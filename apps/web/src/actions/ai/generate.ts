"use server";

import { requireAdmin } from "@/actions/common/auth";
import { aiService } from "@/server/services/ai";
import type { RunAiPromptRequest, RunAiPromptResponse } from "@/types/dto";

export async function runAiPrompt(request: RunAiPromptRequest): Promise<RunAiPromptResponse> {
  try {
    await requireAdmin();
    const data = await aiService.generateFromPrompt(request.prompt);
    return { data };
  } catch (error) {
    console.error("runAiPrompt error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }

    const serverError = new Error("AI 응답 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

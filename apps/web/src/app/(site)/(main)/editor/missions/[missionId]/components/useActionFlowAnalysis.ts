import type { ActionDetail } from "@/types/dto";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { serverCompletionsAtom } from "../atoms/editorDerivedAtoms";
import type { ActionSectionDraftSnapshot } from "./actionSettingsCard.types";
import { analyzeEditorFlow } from "./editor-publish-flow-validation";

interface UseActionFlowAnalysisParams {
  missionData: { data?: { entryActionId: string | null } | null } | undefined;
  actionsData: { data?: ActionDetail[] } | undefined;
  missionError: Error | null;
  actionsError: Error | null;
  isMissionLoading: boolean;
  isActionsLoading: boolean;
  isAiCompletionEnabled: boolean;
  getActionDraftSnapshot: () => ActionSectionDraftSnapshot;
}

export interface UseActionFlowAnalysisReturn {
  flowAnalysis: ReturnType<typeof analyzeEditorFlow> | null;
  flowErrorMessage: string | null;
  isFlowLoading: boolean;
}

export function useActionFlowAnalysis({
  missionData,
  actionsData,
  missionError,
  actionsError,
  isMissionLoading,
  isActionsLoading,
  isAiCompletionEnabled,
  getActionDraftSnapshot,
}: UseActionFlowAnalysisParams): UseActionFlowAnalysisReturn {
  const serverCompletions = useAtomValue(serverCompletionsAtom);

  const flowAnalysis = useMemo(() => {
    if (!missionData?.data || !actionsData?.data || serverCompletions.length === 0) {
      return null;
    }

    return analyzeEditorFlow({
      entryActionId: missionData.data.entryActionId,
      useAiCompletion: isAiCompletionEnabled,
      serverActions: actionsData.data,
      serverCompletions,
      actionDraftSnapshot: getActionDraftSnapshot(),
      completionDraftSnapshot: null,
    });
  }, [
    actionsData?.data,
    serverCompletions,
    getActionDraftSnapshot,
    isAiCompletionEnabled,
    missionData?.data,
  ]);

  const flowErrorMessage =
    missionError instanceof Error
      ? missionError.message
      : actionsError instanceof Error
        ? actionsError.message
        : null;

  const isFlowLoading = isMissionLoading || isActionsLoading;

  return { flowAnalysis, flowErrorMessage, isFlowLoading };
}

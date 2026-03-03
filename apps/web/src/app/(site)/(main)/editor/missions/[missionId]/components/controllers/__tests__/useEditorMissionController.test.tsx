/**
 * @jest-environment jsdom
 */

import type { GetMissionResponse } from "@/types/dto";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { SectionSaveHandle } from "../../editor-save.types";
import { useEditorMissionController } from "../useEditorMissionController";

jest.mock("@/actions/mission/update", () => ({
  updateMission: jest.fn(),
}));

jest.mock("@/actions/mission/draft", () => ({
  saveMissionEditorDraft: jest.fn(),
}));

jest.mock("@repo/ui/components", () => ({
  toast: jest.fn(),
}));

function createMission(partial?: Partial<GetMissionResponse["data"]>) {
  return {
    id: "mission-1",
    isActive: false,
    entryActionId: "action-1",
    ...partial,
  } as unknown as GetMissionResponse["data"];
}

function createSectionHandle(snapshot: unknown): SectionSaveHandle {
  return {
    save: async () => ({ status: "no_changes" }),
    hasPendingChanges: () => false,
    isBusy: () => false,
    exportDraftSnapshot: () => snapshot,
    importDraftSnapshot: () => undefined,
  };
}

describe("useEditorMissionController", () => {
  it("server 데이터가 준비되고 플로우가 유효하면 canPublish가 true다", () => {
    const mission = createMission();

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "preview",
        missionQueryData: mission,
        actionsQueryData: [
          {
            id: "action-1",
            type: "SUBJECTIVE",
            title: "질문 1",
            nextActionId: null,
            nextCompletionId: "completion-1",
            options: [],
          },
        ],
        completionsQueryData: [{ id: "completion-1", title: "완료" }],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({
          data: {
            data: [
              {
                id: "action-1",
                type: "SUBJECTIVE",
                title: "질문 1",
                nextActionId: null,
                nextCompletionId: "completion-1",
                options: [],
              },
            ],
          },
        }),
        refetchCompletions: async () => ({
          data: {
            data: [{ id: "completion-1", title: "완료" }],
          },
        }),
      }),
    );

    expect(result.current.viewState.canPublish).toBe(true);
    expect(result.current.publishState.isValidationDataReady).toBe(true);
  });

  it("검증 데이터가 없으면 canPublish가 false다", () => {
    const mission = createMission();

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "preview",
        missionQueryData: mission,
        actionsQueryData: undefined,
        completionsQueryData: undefined,
        isActionsLoading: true,
        isCompletionsLoading: true,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: undefined } }),
        refetchCompletions: async () => ({ data: { data: undefined } }),
      }),
    );

    expect(result.current.viewState.canPublish).toBe(false);
    expect(result.current.publishState.isValidationDataReady).toBe(false);
  });

  it("entryActionId가 비어도 ref snapshot 준비 후 canPublish가 갱신된다", async () => {
    const mission = createMission({ entryActionId: null });

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [
          {
            id: "action-1",
            type: "SUBJECTIVE",
            title: "질문 1",
            nextActionId: null,
            nextCompletionId: "completion-1",
            options: [],
          },
        ],
        completionsQueryData: [{ id: "completion-1", title: "완료" }],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({
          data: {
            data: [
              {
                id: "action-1",
                type: "SUBJECTIVE",
                title: "질문 1",
                nextActionId: null,
                nextCompletionId: "completion-1",
                options: [],
              },
            ],
          },
        }),
        refetchCompletions: async () => ({
          data: {
            data: [{ id: "completion-1", title: "완료" }],
          },
        }),
      }),
    );

    expect(result.current.viewState.canPublish).toBe(false);

    act(() => {
      result.current.refs.basicInfoRef.current = createSectionHandle(null);
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle({
        draftItems: [],
        itemOrderKeys: ["existing:action-1"],
        formSnapshotByItemKey: {},
      });
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await waitFor(() => {
      expect(result.current.viewState.canPublish).toBe(true);
    });
  });
});

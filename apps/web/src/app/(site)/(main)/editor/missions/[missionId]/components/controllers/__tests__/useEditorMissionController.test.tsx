/**
 * @jest-environment jsdom
 */

import { saveMissionEditorDraft } from "@/actions/mission/draft";
import type { GetMissionResponse } from "@/types/dto";
import { toast } from "@repo/ui/components";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AlertCircle } from "lucide-react";
import type { SectionSaveHandle, SectionSaveOptions } from "../../editor-save.types";
import { useEditorMissionController } from "../useEditorMissionController";

jest.mock("@/actions/mission/update", () => ({
  updateMission: jest.fn(),
}));

jest.mock("@/actions/mission/draft", () => ({
  saveMissionEditorDraft: jest.fn(),
}));

jest.mock("../../editorMissionDraftStorage", () => ({
  getMissionEditorDraftStorageKey: jest.fn(
    (missionId: string) => `mission-editor-draft:${missionId}`,
  ),
  loadMissionEditorDraftFromLocalStorage: jest.fn(() => null),
  saveMissionEditorDraftToLocalStorage: jest.fn(() => true),
}));

jest.mock("@repo/ui/components", () => ({
  toast: jest.fn(),
}));

const mockedSaveMissionEditorDraft = saveMissionEditorDraft as jest.MockedFunction<
  typeof saveMissionEditorDraft
>;
const mockedToast = toast as jest.MockedFunction<typeof toast>;

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

function createPendingSectionHandle(snapshot: unknown): SectionSaveHandle {
  return {
    save: async () => ({ status: "saved", savedCount: 1 }),
    hasPendingChanges: () => true,
    isBusy: () => false,
    exportDraftSnapshot: () => snapshot,
    importDraftSnapshot: () => undefined,
  };
}

function createPendingSectionHandleWithSpy(
  snapshot: unknown,
  saveSpy: jest.Mock<void, [SectionSaveOptions | undefined]>,
): SectionSaveHandle {
  return {
    save: async (options?: SectionSaveOptions) => {
      saveSpy(options);
      return { status: "saved", savedCount: 1 };
    },
    hasPendingChanges: () => true,
    isBusy: () => false,
    exportDraftSnapshot: () => snapshot,
    importDraftSnapshot: () => undefined,
  };
}

describe("useEditorMissionController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSaveMissionEditorDraft.mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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
    expect(result.current.viewState.canSave).toBe(true);
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
    expect(result.current.viewState.canSave).toBe(false);
    expect(result.current.publishState.isValidationDataReady).toBe(false);
  });

  it("발행 상태여도 플로우가 유효하면 canSave는 true이고 canPublish는 false다", () => {
    const mission = createMission({ isActive: true });

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
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    expect(result.current.viewState.canPublish).toBe(false);
    expect(result.current.viewState.canSave).toBe(true);
  });

  it("발행 상태에서 플로우가 유효하지 않으면 canSave가 false다", () => {
    const mission = createMission({ isActive: true, entryActionId: null });

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "preview",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    expect(result.current.viewState.canSave).toBe(false);
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

  it("미발행 + 변경 있음 + editor 탭에서 20초 server draft 자동저장이 동작한다", async () => {
    jest.useFakeTimers();
    const mission = createMission({ isActive: false, entryActionId: null });

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
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = createPendingSectionHandle({ title: "기본정보" });
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle({
        draftItems: [],
        itemOrderKeys: ["existing:action-1"],
        formSnapshotByItemKey: {},
      });
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await act(async () => {
      jest.advanceTimersByTime(20_000);
    });

    await waitFor(() => {
      expect(mockedSaveMissionEditorDraft).toHaveBeenCalledWith(
        mission.id,
        expect.objectContaining({
          basic: expect.anything(),
          meta: expect.objectContaining({ updatedAtMs: expect.any(Number) }),
        }),
      );
    });

    expect(mockedToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "editor-mission-server-draft-autosave",
        message: "임시 저장 중...",
        iconOnly: true,
        icon: expect.anything(),
        iconClassName: "animate-spin text-white",
      }),
    );
    expect(mockedToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "editor-mission-server-draft-autosave",
        message: "임시 저장되었습니다.",
        icon: expect.anything(),
        iconClassName: "text-green-500",
      }),
    );
  });

  it("autosave 실패 시 에러 아이콘과 메시지로 토스트를 갱신한다", async () => {
    jest.useFakeTimers();
    const mission = createMission({ isActive: false });
    mockedSaveMissionEditorDraft.mockRejectedValueOnce(new Error("autosave failed"));

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = createPendingSectionHandle({ title: "기본정보" });
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await act(async () => {
      jest.advanceTimersByTime(20_000);
    });

    await waitFor(() => {
      expect(mockedToast).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "editor-mission-server-draft-autosave",
          message: "autosave failed",
          icon: AlertCircle,
          iconClassName: "text-red-500",
        }),
      );
    });
  });

  it("발행 상태에서는 20초 server draft 자동저장이 동작하지 않는다", async () => {
    jest.useFakeTimers();
    const mission = createMission({ isActive: true });

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = createPendingSectionHandle({ title: "기본정보" });
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    expect(mockedSaveMissionEditorDraft).not.toHaveBeenCalledWith(
      mission.id,
      expect.objectContaining({ basic: expect.anything() }),
    );
  });

  it("변경사항이 없으면 autosave 요청과 토스트를 발생시키지 않는다", async () => {
    jest.useFakeTimers();
    const mission = createMission({ isActive: false });

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = createSectionHandle({ title: "기본정보" });
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    expect(mockedSaveMissionEditorDraft).not.toHaveBeenCalledWith(
      mission.id,
      expect.objectContaining({ basic: expect.anything() }),
    );
    expect(mockedToast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        id: "editor-mission-server-draft-autosave",
      }),
    );
  });

  it("저장하기는 publish trigger로 저장하고 draft payload 저장 없이 실제 섹션 저장 결과만 반영한다", async () => {
    const mission = createMission({ isActive: true });
    const saveOptionsSpy = jest.fn<void, [SectionSaveOptions | undefined]>();

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
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = createPendingSectionHandleWithSpy(
        { title: "기본정보" },
        saveOptionsSpy,
      );
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {
      await result.current.actions.onSave();
    });

    const payloadCalls = mockedSaveMissionEditorDraft.mock.calls.filter(([, payload]) => payload);
    expect(payloadCalls).toHaveLength(0);
    expect(mockedSaveMissionEditorDraft).toHaveBeenCalledWith(mission.id, null);
    expect(saveOptionsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: "publish", showValidationUi: true }),
    );
  });

  it("발행 상태에서는 draft가 있어도 복원하지 않고 복원 토스트를 노출하지 않는다", async () => {
    const { loadMissionEditorDraftFromLocalStorage } = jest.requireMock(
      "../../editorMissionDraftStorage",
    ) as { loadMissionEditorDraftFromLocalStorage: jest.Mock };
    loadMissionEditorDraftFromLocalStorage.mockReturnValueOnce({
      basic: { title: "로컬 임시저장" },
      meta: { updatedAtMs: Date.now() },
    });

    const mission = createMission({
      isActive: true,
      editorDraft: {
        basic: { title: "서버 임시저장" },
        meta: { updatedAtMs: Date.now() - 1000 },
      },
    } as any);

    const importSpy = jest.fn();

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = {
        ...createSectionHandle(null),
        importDraftSnapshot: importSpy,
      };
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {});

    expect(importSpy).not.toHaveBeenCalled();
    expect(mockedToast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        message: "임시 저장된 편집 내용이 복원되었습니다.",
      }),
    );
  });

  it("SSR mission이 발행 상태이고 쿼리 캐시가 미발행 상태여도 복원하지 않는다", async () => {
    const { loadMissionEditorDraftFromLocalStorage } = jest.requireMock(
      "../../editorMissionDraftStorage",
    ) as { loadMissionEditorDraftFromLocalStorage: jest.Mock };
    loadMissionEditorDraftFromLocalStorage.mockReturnValueOnce({
      basic: { title: "로컬 임시저장" },
      meta: { updatedAtMs: Date.now() },
    });

    const ssrMission = createMission({ isActive: true });
    const staleCachedMission = createMission({ isActive: false });
    const importSpy = jest.fn();

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: ssrMission.id,
        mission: ssrMission,
        currentTab: "editor",
        missionQueryData: staleCachedMission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: ssrMission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = {
        ...createSectionHandle(null),
        importDraftSnapshot: importSpy,
      };
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {});

    expect(importSpy).not.toHaveBeenCalled();
    expect(mockedToast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        message: "임시 저장된 편집 내용이 복원되었습니다.",
      }),
    );
  });

  it("미발행 상태에서 draft가 있으면 복원하고 복원 토스트를 노출한다", async () => {
    const { loadMissionEditorDraftFromLocalStorage } = jest.requireMock(
      "../../editorMissionDraftStorage",
    ) as { loadMissionEditorDraftFromLocalStorage: jest.Mock };
    loadMissionEditorDraftFromLocalStorage.mockReturnValueOnce({
      basic: { title: "로컬 임시저장" },
      meta: { updatedAtMs: Date.now() },
    });

    const mission = createMission({ isActive: false });
    const importSpy = jest.fn();

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = {
        ...createSectionHandle(null),
        importDraftSnapshot: importSpy,
      };
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await waitFor(() => {
      expect(importSpy).toHaveBeenCalled();
    });

    expect(mockedToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "임시 저장된 편집 내용이 복원되었습니다.",
      }),
    );
  });

  it("canSave가 false면 저장을 차단하고 안내 토스트를 노출한다", async () => {
    const mission = createMission({ isActive: true, entryActionId: null });
    const saveOptionsSpy = jest.fn<void, [SectionSaveOptions | undefined]>();

    const { result } = renderHook(() =>
      useEditorMissionController({
        missionId: mission.id,
        mission,
        currentTab: "editor",
        missionQueryData: mission,
        actionsQueryData: [],
        completionsQueryData: [],
        isActionsLoading: false,
        isCompletionsLoading: false,
        refetchMission: async () => ({ data: { data: mission } }),
        refetchActions: async () => ({ data: { data: [] } }),
        refetchCompletions: async () => ({ data: { data: [] } }),
      }),
    );

    act(() => {
      result.current.refs.basicInfoRef.current = createPendingSectionHandleWithSpy(
        { title: "기본정보" },
        saveOptionsSpy,
      );
      result.current.refs.rewardRef.current = createSectionHandle(null);
      result.current.refs.actionRef.current = createSectionHandle(null);
      result.current.refs.completionRef.current = createSectionHandle(null);
    });

    await act(async () => {
      await result.current.actions.onSave();
    });

    expect(saveOptionsSpy).not.toHaveBeenCalled();
    expect(mockedSaveMissionEditorDraft).not.toHaveBeenCalled();
    expect(mockedToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "editor-mission-save-result",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      }),
    );
  });
});

/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import {
  addCompletionDraftAtom,
  completionDirtyByItemKeyAtom,
  markCompletionRemovedAtom,
  resetCompletionAfterSaveAtom,
} from "../../atoms/editorCompletionAtoms";
import { useCompletionSettingsCard } from "../useCompletionSettingsCard";

const MOCK_COMPLETION_1 = {
  id: "comp-1",
  missionId: "test-mission",
  title: "결과 1",
  description: "설명 1",
  imageUrl: null,
  imageFileUploadId: null,
  minScoreRatio: null,
  maxScoreRatio: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  mission: { id: "test-mission", title: "테스트" },
};

const MOCK_COMPLETION_2 = {
  id: "comp-2",
  missionId: "test-mission",
  title: "결과 2",
  description: "설명 2",
  imageUrl: null,
  imageFileUploadId: null,
  minScoreRatio: null,
  maxScoreRatio: null,
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  mission: { id: "test-mission", title: "테스트" },
};

let mockCompletionsData: { data: (typeof MOCK_COMPLETION_1)[] } = { data: [] };

jest.mock("@/actions/mission-completion", () => ({
  createMissionCompletion: jest.fn(),
  deleteMissionCompletion: jest.fn(),
  getCompletionsByMissionId: jest.fn(() => Promise.resolve(mockCompletionsData)),
  updateMissionCompletion: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: mockCompletionsData,
    isLoading: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
}));

jest.mock("@repo/ui/components", () => ({
  toast: jest.fn(),
}));

jest.mock("@/constants/queryKeys/missionCompletionQueryKeys", () => ({
  missionCompletionQueryKeys: {
    missionCompletion: (id: string) => ["missionCompletion", id],
  },
}));

jest.mock("@/constants/queryKeys/actionQueryKeys", () => ({
  actionQueryKeys: {
    actions: (params: { missionId: string }) => ["actions", params.missionId],
  },
}));

jest.mock("../EditorMissionDraftContext", () => ({
  getCompletionDraftItemKey: (draftKey: string) => `draft:${draftKey}`,
  makeDraftCompletionId: (draftKey: string) => `draft:completion:${draftKey}`,
  useEditorMissionDraft: () => ({
    registerCompletionDraftForm: jest.fn(),
  }),
}));

function createWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function renderCompletionHook(
  options: {
    store?: ReturnType<typeof createStore>;
    isQuizMode?: boolean;
    completions?: (typeof MOCK_COMPLETION_1)[];
  } = {},
) {
  const testStore = options.store ?? createStore();
  const onSaveStateChange = jest.fn();

  if (options.completions) {
    mockCompletionsData = { data: options.completions };
  } else {
    mockCompletionsData = { data: [] };
  }

  const result = renderHook(
    () =>
      useCompletionSettingsCard({
        missionId: "test-mission",
        isQuizMode: options.isQuizMode ?? false,
        onSaveStateChange,
      }),
    { wrapper: createWrapper(testStore) },
  );

  return { ...result, store: testStore, onSaveStateChange };
}

describe("useCompletionSettingsCard - hasPendingChanges lifecycle", () => {
  beforeEach(() => {
    mockCompletionsData = { data: [] };
  });

  describe("초기 상태", () => {
    // Given: 서버 데이터 없음, draft 없음
    // Then: hasPendingChanges = false
    it("draft도 기존 데이터도 없으면 hasPendingChanges는 false이다", () => {
      const { result } = renderCompletionHook();
      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });

    // Given: 초기 상태
    // Then: onSaveStateChange가 hasPendingChanges: false로 호출된다
    it("onSaveStateChange가 초기 상태를 보고한다", () => {
      const { onSaveStateChange } = renderCompletionHook();
      expect(onSaveStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasPendingChanges: false }),
      );
    });
  });

  describe("draft 추가", () => {
    // Given: 빈 상태
    // When: draft 추가
    // Then: hasPendingChanges = true
    it("draft 추가 후 hasPendingChanges는 true이다", () => {
      const { result, store } = renderCompletionHook();

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(true);
    });

    // Given: draft 추가 상태
    // Then: onSaveStateChange가 hasPendingChanges: true로 호출된다
    it("draft 추가 시 onSaveStateChange가 재보고된다", () => {
      const { result, store, onSaveStateChange } = renderCompletionHook();

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
      });

      expect(onSaveStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasPendingChanges: true }),
      );
    });
  });

  describe("draft 추가 후 resetAfterSave", () => {
    // Given: draft 추가된 상태
    // When: resetCompletionAfterSaveAtom으로 해당 draft를 성공 처리
    // Then: hasPendingChanges = false
    it("저장 후 draft를 제거하면 hasPendingChanges는 false이다", () => {
      const { result, store } = renderCompletionHook();

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
      });
      expect(result.current.viewState.hasPendingChanges).toBe(true);

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["draft:draft-1"]),
          successfulDraftKeys: ["draft-1"],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: [],
        });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });
  });

  describe("기존 아이템 삭제", () => {
    // Given: 기존 completion이 있는 상태
    // When: 기존 아이템 삭제 마킹
    // Then: hasPendingChanges = true
    it("기존 아이템 삭제 마킹 후 hasPendingChanges는 true이다", () => {
      const { result, store } = renderCompletionHook({
        completions: [MOCK_COMPLETION_1],
      });

      act(() => {
        store.set(markCompletionRemovedAtom, "comp-1");
      });

      expect(result.current.viewState.hasPendingChanges).toBe(true);
    });

    // Given: 삭제 마킹된 상태
    // When: resetAfterSave로 성공 처리
    // Then: hasPendingChanges = false
    it("삭제 저장 후 hasPendingChanges는 false이다", () => {
      const { result, store } = renderCompletionHook({
        completions: [MOCK_COMPLETION_1],
      });

      act(() => {
        store.set(markCompletionRemovedAtom, "comp-1");
      });
      expect(result.current.viewState.hasPendingChanges).toBe(true);

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set<string>(),
          successfulDraftKeys: [],
          successfulRemovedIds: new Set(["comp-1"]),
          successfulExistingIds: [],
        });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });
  });

  describe("기존 아이템 dirty", () => {
    // Given: 기존 completion이 있는 상태
    // When: dirtyByItemKey에 해당 아이템이 dirty로 마킹
    // Then: hasPendingChanges = true
    it("기존 아이템이 dirty이면 hasPendingChanges는 true이다", () => {
      const { result, store } = renderCompletionHook({
        completions: [MOCK_COMPLETION_1],
      });

      act(() => {
        store.set(completionDirtyByItemKeyAtom, { "existing:comp-1": true });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(true);
    });

    // Given: dirty 상태
    // When: resetAfterSave로 dirty 클리어
    // Then: hasPendingChanges = false
    it("dirty 클리어 후 hasPendingChanges는 false이다", () => {
      const { result, store } = renderCompletionHook({
        completions: [MOCK_COMPLETION_1],
      });

      act(() => {
        store.set(completionDirtyByItemKeyAtom, { "existing:comp-1": true });
      });
      expect(result.current.viewState.hasPendingChanges).toBe(true);

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["existing:comp-1"]),
          successfulDraftKeys: [],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: ["comp-1"],
        });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });
  });

  describe("quiz 모드 threshold 변경", () => {
    // Given: quiz 모드, 기존 completion 2개 있음
    // When: threshold를 변경
    // Then: hasPendingChanges = true
    it("threshold 변경 후 hasPendingChanges는 true이다", () => {
      const { result } = renderCompletionHook({
        isQuizMode: true,
        completions: [MOCK_COMPLETION_1, MOCK_COMPLETION_2],
      });

      act(() => {
        result.current.quizState.updateThreshold(0, 80);
      });

      expect(result.current.viewState.hasPendingChanges).toBe(true);
    });
  });

  describe("imperative hasPendingChanges()", () => {
    // Given: draft 추가된 상태
    // Then: saveHandle.hasPendingChanges()도 true 반환
    it("saveHandle.hasPendingChanges()가 최신 상태를 반환한다", () => {
      const { result, store } = renderCompletionHook();

      expect(result.current.saveHandle.hasPendingChanges()).toBe(false);

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
      });

      expect(result.current.saveHandle.hasPendingChanges()).toBe(true);
    });

    // Given: draft 추가 후 reset
    // Then: saveHandle.hasPendingChanges()가 false 반환
    it("reset 후 saveHandle.hasPendingChanges()가 false를 반환한다", () => {
      const { result, store } = renderCompletionHook();

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
      });
      expect(result.current.saveHandle.hasPendingChanges()).toBe(true);

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["draft:draft-1"]),
          successfulDraftKeys: ["draft-1"],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: [],
        });
      });

      expect(result.current.saveHandle.hasPendingChanges()).toBe(false);
    });
  });

  describe("quiz 모드: draft 추가 후 resetAfterSave", () => {
    // Given: quiz 모드, 기존 completion 2개, draft 1개 추가 후 저장
    // When: resetAfterSave로 draft 제거 (aggregate save 후 onAfterApply 시뮬레이션)
    // Then: hasPendingChanges = false (threshold auto-adjustment가 false dirty를 유발하면 안 됨)
    it("quiz 모드에서 draft 제거 후 threshold 변화가 false dirty를 유발하지 않는다", () => {
      const { result, store } = renderCompletionHook({
        isQuizMode: true,
        completions: [MOCK_COMPLETION_1, MOCK_COMPLETION_2],
      });

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
      });
      expect(result.current.viewState.hasPendingChanges).toBe(true);

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["draft:draft-1"]),
          successfulDraftKeys: ["draft-1"],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: [],
        });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });

    // Given: quiz 모드, 기존 2개 + draft 1개 → 저장 → draft 제거
    // When: completionItems.length가 일시적으로 감소 (draft 제거됨, refetch 전)
    // Then: threshold auto-adjustment 후에도 hasPendingChanges = false
    it("quiz 모드에서 저장 후 일시적 아이템 수 감소가 false dirty를 유발하지 않는다", () => {
      const { result, store } = renderCompletionHook({
        isQuizMode: true,
        completions: [MOCK_COMPLETION_1, MOCK_COMPLETION_2],
      });

      // Given: threshold 초기화 확인
      const initialThresholds = result.current.quizState.thresholds;
      expect(initialThresholds.length).toBe(1);

      // When: draft 추가 → threshold 자동 조정 (2개)
      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과 3" });
      });
      expect(result.current.quizState.thresholds.length).toBe(2);
      expect(result.current.viewState.hasPendingChanges).toBe(true);

      // When: 저장 후 draft 제거 → threshold 자동 조정 (1개로 복귀)
      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["draft:draft-1"]),
          successfulDraftKeys: ["draft-1"],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: [],
        });
      });

      // Then: threshold 기준선이 동기화되어 false dirty 없음
      expect(result.current.quizState.thresholds.length).toBe(1);
      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });
  });

  describe("복합 시나리오", () => {
    // Given: draft 추가 + 기존 dirty + 삭제 마킹
    // When: 모두 성공적으로 저장 후 reset
    // Then: hasPendingChanges = false
    it("모든 변경사항이 저장되면 hasPendingChanges는 false이다", () => {
      const { result, store } = renderCompletionHook({
        completions: [MOCK_COMPLETION_1],
      });

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
        store.set(completionDirtyByItemKeyAtom, { "existing:comp-1": true });
      });
      expect(result.current.viewState.hasPendingChanges).toBe(true);

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["draft:draft-1", "existing:comp-1"]),
          successfulDraftKeys: ["draft-1"],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: ["comp-1"],
        });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });

    // Given: 일부만 성공적으로 저장
    // Then: 실패한 항목 때문에 hasPendingChanges = true
    it("일부만 저장되면 hasPendingChanges는 여전히 true이다", () => {
      const { result, store } = renderCompletionHook({
        completions: [MOCK_COMPLETION_1],
      });

      act(() => {
        store.set(addCompletionDraftAtom, { draftKey: "draft-1", title: "새 결과" });
        store.set(completionDirtyByItemKeyAtom, { "existing:comp-1": true });
      });

      act(() => {
        store.set(resetCompletionAfterSaveAtom, {
          successfulItemKeys: new Set(["existing:comp-1"]),
          successfulDraftKeys: [],
          successfulRemovedIds: new Set<string>(),
          successfulExistingIds: ["comp-1"],
        });
      });

      expect(result.current.viewState.hasPendingChanges).toBe(true);
    });
  });
});

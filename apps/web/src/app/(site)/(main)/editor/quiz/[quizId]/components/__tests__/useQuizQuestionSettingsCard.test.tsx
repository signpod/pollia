/**
 * @jest-environment jsdom
 */

import { ActionType } from "@prisma/client";
import { act, renderHook } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import {
  quizActionDirtyByItemKeyAtom,
  quizActionDraftItemsAtom,
} from "../../atoms/quizActionAtoms";
import { useQuizQuestionSettingsCard } from "../useQuizQuestionSettingsCard";

jest.mock("@/hooks/action", () => ({
  useReadActionsDetail: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}));

jest.mock("@/app/(site)/mission/[missionId]/manage/actions/hooks", () => ({
  useManageDeleteAction: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock("@repo/ui/components", () => ({
  toast: jest.fn(),
}));

jest.mock("../useQuizActionSaveFlow", () => ({
  useQuizActionSaveFlow: jest.fn(() => ({
    isApplying: false,
    saveHandle: {
      save: jest.fn(async () => ({ status: "no_changes" })),
      hasPendingChanges: () => false,
      isBusy: () => false,
      exportDraftSnapshot: () => null,
      importDraftSnapshot: () => undefined,
    },
  })),
}));

function createWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function renderQuizQuestionHook(store?: ReturnType<typeof createStore>) {
  const testStore = store ?? createStore();
  const onSaveStateChange = jest.fn();

  const result = renderHook(
    () =>
      useQuizQuestionSettingsCard({
        missionId: "test-mission-id",
        onSaveStateChange,
      }),
    { wrapper: createWrapper(testStore) },
  );

  return { ...result, store: testStore, onSaveStateChange };
}

describe("useQuizQuestionSettingsCard", () => {
  describe("handleAddDraft", () => {
    // Given: 빈 상태
    // When: handleAddDraft 호출
    // Then: 드래프트 아이템이 추가된다
    it("드래프트 아이템을 추가한다", () => {
      const { result, store } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const draftItems = store.get(quizActionDraftItemsAtom);
      expect(draftItems).toHaveLength(1);
      expect(draftItems[0].key).toBeDefined();
    });

    // Given: 빈 상태
    // When: handleAddDraft 호출
    // Then: 새 아이템의 기본 타입이 MULTIPLE_CHOICE이다
    it("새 드래프트의 기본 타입은 MULTIPLE_CHOICE이다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const items = result.current.listState.orderedActionItems;
      expect(items).toHaveLength(1);
      expect(result.current.listState.actionTypeByItemKey[items[0].key]).toBe(
        ActionType.MULTIPLE_CHOICE,
      );
    });

    // Given: 빈 상태
    // When: handleAddDraft 호출
    // Then: 새 아이템이 열린 상태가 된다
    it("새 드래프트가 열린 상태가 된다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const items = result.current.listState.orderedActionItems;
      expect(result.current.listState.openItemKey).toBe(items[0].key);
    });

    // Given: 빈 상태
    // When: handleAddDraft 두 번 호출
    // Then: 드래프트 아이템이 2개 추가된다
    it("여러 번 호출하면 그만큼 드래프트가 추가된다", () => {
      const { result, store } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
        result.current.handlers.handleAddDraft();
      });

      const draftItems = store.get(quizActionDraftItemsAtom);
      expect(draftItems).toHaveLength(2);
    });
  });

  describe("handleRemoveDraft", () => {
    // Given: 드래프트가 1개 있을 때
    // When: handleRemoveDraft 호출
    // Then: 드래프트가 제거된다
    it("지정한 드래프트를 제거한다", () => {
      const { result, store } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const draftKey = store.get(quizActionDraftItemsAtom)[0].key;

      act(() => {
        result.current.handlers.handleRemoveDraft(draftKey);
      });

      expect(store.get(quizActionDraftItemsAtom)).toHaveLength(0);
    });

    // Given: 드래프트가 열려있을 때
    // When: 해당 드래프트를 제거
    // Then: openItemKey가 null로 초기화된다
    it("열린 드래프트를 제거하면 openItemKey가 null이 된다", () => {
      const { result, store } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const draftKey = store.get(quizActionDraftItemsAtom)[0].key;
      expect(result.current.listState.openItemKey).not.toBeNull();

      act(() => {
        result.current.handlers.handleRemoveDraft(draftKey);
      });

      expect(result.current.listState.openItemKey).toBeNull();
    });
  });

  describe("handleToggleItem", () => {
    // Given: 열린 아이템
    // When: handleToggleItem 호출
    // Then: 닫힌다
    it("열린 아이템을 토글하면 닫힌다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const itemKey = result.current.listState.orderedActionItems[0].key;
      expect(result.current.listState.openItemKey).toBe(itemKey);

      act(() => {
        result.current.handlers.handleToggleItem(itemKey);
      });

      expect(result.current.listState.openItemKey).toBeNull();
    });

    // Given: 닫힌 아이템
    // When: handleToggleItem 호출
    // Then: 열린다
    it("닫힌 아이템을 토글하면 열린다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const itemKey = result.current.listState.orderedActionItems[0].key;

      act(() => {
        result.current.handlers.handleToggleItem(itemKey);
      });
      expect(result.current.listState.openItemKey).toBeNull();

      act(() => {
        result.current.handlers.handleToggleItem(itemKey);
      });
      expect(result.current.listState.openItemKey).toBe(itemKey);
    });
  });

  describe("handleActionTypeChange", () => {
    // Given: MULTIPLE_CHOICE 타입의 드래프트
    // When: OX로 변경
    // Then: 타입이 변경된다
    it("액션 타입을 변경한다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const itemKey = result.current.listState.orderedActionItems[0].key;

      act(() => {
        result.current.handlers.handleActionTypeChange(itemKey, ActionType.OX);
      });

      expect(result.current.listState.actionTypeByItemKey[itemKey]).toBe(ActionType.OX);
    });
  });

  describe("handleMoveItem", () => {
    // Given: 2개의 드래프트 아이템
    // When: 첫 번째를 아래로 이동
    // Then: 순서가 변경된다
    it("아이템을 아래로 이동한다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
        result.current.handlers.handleAddDraft();
      });

      const items = result.current.listState.orderedActionItems;
      const firstKey = items[0].key;
      const secondKey = items[1].key;

      act(() => {
        result.current.handlers.handleMoveItem(firstKey, "down");
      });

      const reordered = result.current.listState.orderedActionItems;
      expect(reordered[0].key).toBe(secondKey);
      expect(reordered[1].key).toBe(firstKey);
    });

    // Given: 첫 번째 아이템
    // When: 위로 이동 시도
    // Then: 순서가 변경되지 않는다
    it("첫 번째 아이템은 위로 이동할 수 없다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
        result.current.handlers.handleAddDraft();
      });

      const items = result.current.listState.orderedActionItems;
      const firstKey = items[0].key;

      act(() => {
        result.current.handlers.handleMoveItem(firstKey, "up");
      });

      expect(result.current.listState.orderedActionItems[0].key).toBe(firstKey);
    });
  });

  describe("viewState", () => {
    // Given: 초기 상태
    // Then: hasPendingChanges가 false이다
    it("초기 상태에서 hasPendingChanges는 false이다", () => {
      const { result } = renderQuizQuestionHook();
      expect(result.current.viewState.hasPendingChanges).toBe(false);
    });

    // Given: 드래프트가 추가되었을 때
    // Then: hasPendingChanges가 true이다
    it("드래프트가 있으면 hasPendingChanges는 true이다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      expect(result.current.viewState.hasPendingChanges).toBe(true);
    });

    // Given: 초기 상태
    // Then: validationIssueCount가 0이다
    it("초기 상태에서 validationIssueCount는 0이다", () => {
      const { result } = renderQuizQuestionHook();
      expect(result.current.viewState.validationIssueCount).toBe(0);
      expect(result.current.viewState.hasValidationIssues).toBe(false);
    });

    // Given: 아이템에 유효성 이슈가 있을 때
    // Then: validationIssueCount가 합산된다
    it("유효성 이슈 카운트를 합산한다", () => {
      const { result } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const itemKey = result.current.listState.orderedActionItems[0].key;

      act(() => {
        result.current.handlers.handleItemValidationChange(itemKey, 3);
      });

      expect(result.current.viewState.validationIssueCount).toBe(3);
      expect(result.current.viewState.hasValidationIssues).toBe(true);
    });
  });

  describe("handleItemDirtyChange", () => {
    // Given: 드래프트 아이템
    // When: dirty 상태 변경
    // Then: dirtyByItemKey가 갱신된다
    it("아이템의 dirty 상태를 갱신한다", () => {
      const { result, store } = renderQuizQuestionHook();

      act(() => {
        result.current.handlers.handleAddDraft();
      });

      const itemKey = result.current.listState.orderedActionItems[0].key;

      act(() => {
        result.current.handlers.handleItemDirtyChange(itemKey, true);
      });

      const dirtyMap = store.get(quizActionDirtyByItemKeyAtom);
      expect(dirtyMap[itemKey]).toBe(true);
    });
  });

  describe("onSaveStateChange", () => {
    // Given: 상태가 변경될 때
    // Then: onSaveStateChange 콜백이 호출된다
    it("상태 변경 시 onSaveStateChange가 호출된다", () => {
      const { onSaveStateChange } = renderQuizQuestionHook();

      expect(onSaveStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          hasPendingChanges: false,
          hasValidationIssues: false,
          validationIssueCount: 0,
        }),
      );
    });
  });
});

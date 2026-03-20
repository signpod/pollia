/**
 * @jest-environment jsdom
 */

import type { EditorMissionDraftPayload } from "@/types/mission-editor-draft";
import { act, renderHook } from "@testing-library/react";
import { useEditorUndoRedo } from "../useEditorUndoRedo";

function makeSnapshot(label: string): EditorMissionDraftPayload {
  return { basic: label };
}

function renderUndoRedo(
  overrides: {
    collectSnapshot?: () => EditorMissionDraftPayload;
    applySnapshot?: (p: EditorMissionDraftPayload) => Promise<void>;
    enabled?: boolean;
    maxHistory?: number;
  } = {},
) {
  const appliedSnapshots: EditorMissionDraftPayload[] = [];
  let currentSnapshot = makeSnapshot("initial");

  const collectSnapshot = overrides.collectSnapshot ?? (() => currentSnapshot);
  const applySnapshot =
    overrides.applySnapshot ??
    (async (p: EditorMissionDraftPayload) => {
      currentSnapshot = p;
      appliedSnapshots.push(p);
    });

  const result = renderHook(() =>
    useEditorUndoRedo({
      collectSnapshot,
      applySnapshot,
      enabled: overrides.enabled ?? true,
      maxHistory: overrides.maxHistory,
    }),
  );

  function setCurrentSnapshot(s: EditorMissionDraftPayload) {
    currentSnapshot = s;
  }

  return { ...result, appliedSnapshots, setCurrentSnapshot };
}

describe("useEditorUndoRedo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("초기 상태", () => {
    // Given: 훅이 초기화된 상태
    // Then: canUndo, canRedo 모두 false
    it("초기 상태에서 canUndo, canRedo가 false이다", () => {
      const { result } = renderUndoRedo();

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("pushSnapshot", () => {
    // Given: 스냅샷을 2번 push
    // Then: canUndo가 true, canRedo는 false
    it("스냅샷 push 후 canUndo가 true가 된다", () => {
      const { result, setCurrentSnapshot } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });

      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    // Given: 동일한 스냅샷을 연속 push
    // Then: 중복이 무시되어 canUndo가 false 유지
    it("동일한 스냅샷은 중복 push되지 않는다", () => {
      const { result } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });
      act(() => {
        result.current.pushSnapshot();
      });

      expect(result.current.canUndo).toBe(false);
    });

    // Given: enabled가 false
    // Then: pushSnapshot이 무시된다
    it("enabled가 false이면 pushSnapshot이 무시된다", () => {
      const { result, setCurrentSnapshot } = renderUndoRedo({ enabled: false });

      act(() => {
        result.current.pushSnapshot();
      });
      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      expect(result.current.canUndo).toBe(false);
    });
  });

  describe("undo", () => {
    // Given: 스냅샷 2개 push 후 undo
    // Then: canRedo가 true, 이전 스냅샷이 apply됨
    it("undo 후 canRedo가 true이고 이전 스냅샷이 적용된다", async () => {
      const { result, setCurrentSnapshot, appliedSnapshots } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });
      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      await act(async () => {
        await result.current.undo();
      });
      jest.runAllTimers();

      expect(result.current.canRedo).toBe(true);
      expect(appliedSnapshots).toHaveLength(1);
      expect(appliedSnapshots[0]).toEqual(makeSnapshot("initial"));
    });

    // Given: 히스토리가 1개뿐
    // Then: undo가 무시된다
    it("히스토리가 1개뿐이면 undo가 무시된다", async () => {
      const { result, appliedSnapshots } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });

      await act(async () => {
        await result.current.undo();
      });

      expect(appliedSnapshots).toHaveLength(0);
      expect(result.current.canUndo).toBe(false);
    });
  });

  describe("redo", () => {
    // Given: undo 후 redo
    // Then: 다음 스냅샷이 apply됨, canRedo가 false
    it("redo 후 다음 스냅샷이 적용되고 canRedo가 false가 된다", async () => {
      const { result, setCurrentSnapshot, appliedSnapshots } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });
      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      await act(async () => {
        await result.current.undo();
      });
      jest.runAllTimers();

      await act(async () => {
        await result.current.redo();
      });
      jest.runAllTimers();

      expect(result.current.canRedo).toBe(false);
      expect(result.current.canUndo).toBe(true);
      expect(appliedSnapshots).toHaveLength(2);
      expect(appliedSnapshots[1]).toEqual(makeSnapshot("second"));
    });

    // Given: redo할 히스토리가 없는 상태
    // Then: redo가 무시된다
    it("redo할 히스토리가 없으면 무시된다", async () => {
      const { result, appliedSnapshots } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });

      await act(async () => {
        await result.current.redo();
      });

      expect(appliedSnapshots).toHaveLength(0);
    });
  });

  describe("undo/redo 진행 중 pushSnapshot 차단", () => {
    // Given: undo 진행 중
    // Then: pushSnapshot이 무시된다
    it("undo 진행 중 pushSnapshot이 무시된다", async () => {
      let resolveApply!: () => void;
      const applySnapshot = jest.fn(
        () =>
          new Promise<void>(resolve => {
            resolveApply = resolve;
          }),
      );

      const { result, setCurrentSnapshot } = renderUndoRedo({ applySnapshot });

      act(() => {
        result.current.pushSnapshot();
      });
      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      // When: undo 시작 (아직 resolve 안됨)
      let undoPromise: Promise<void>;
      act(() => {
        undoPromise = result.current.undo();
      });

      // Then: 진행 중 플래그가 true
      expect(result.current.getIsUndoRedoInProgress()).toBe(true);

      // When: 진행 중에 pushSnapshot 시도
      setCurrentSnapshot(makeSnapshot("third"));
      act(() => {
        result.current.pushSnapshot();
      });

      // Then: undo 후에도 canRedo가 유지됨 (pushSnapshot이 차단되었으므로)
      await act(async () => {
        resolveApply();
        await undoPromise!;
      });
      jest.runAllTimers();

      expect(result.current.canRedo).toBe(true);
    });

    // Given: undo 완료 후 setTimeout(0) 전
    // Then: getIsUndoRedoInProgress()가 여전히 true
    it("undo 완료 직후 setTimeout(0) 전에는 플래그가 true이다", async () => {
      const { result, setCurrentSnapshot } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });
      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      await act(async () => {
        await result.current.undo();
      });

      // setTimeout(0)이 아직 실행되지 않은 상태
      expect(result.current.getIsUndoRedoInProgress()).toBe(true);

      // setTimeout(0) 실행 후 플래그 해제
      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.getIsUndoRedoInProgress()).toBe(false);
    });
  });

  describe("undo 후 새 스냅샷 push", () => {
    // Given: undo 후 새로운 변경을 push
    // Then: redo 히스토리가 삭제된다
    it("undo 후 새 스냅샷 push 시 redo 히스토리가 삭제된다", async () => {
      const { result, setCurrentSnapshot } = renderUndoRedo();

      act(() => {
        result.current.pushSnapshot();
      });
      setCurrentSnapshot(makeSnapshot("second"));
      act(() => {
        result.current.pushSnapshot();
      });

      await act(async () => {
        await result.current.undo();
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.canRedo).toBe(true);

      // When: 새 변경을 push
      setCurrentSnapshot(makeSnapshot("third"));
      act(() => {
        result.current.pushSnapshot();
      });

      // Then: redo 히스토리 삭제
      expect(result.current.canRedo).toBe(false);
      expect(result.current.canUndo).toBe(true);
    });
  });

  describe("maxHistory 제한", () => {
    // Given: maxHistory=3인 상태에서 4개의 스냅샷 push
    // Then: 가장 오래된 스냅샷이 삭제된다
    it("maxHistory를 초과하면 가장 오래된 스냅샷이 삭제된다", async () => {
      const { result, setCurrentSnapshot } = renderUndoRedo({ maxHistory: 3 });

      for (let i = 0; i < 4; i++) {
        setCurrentSnapshot(makeSnapshot(`snapshot-${i}`));
        act(() => {
          result.current.pushSnapshot();
        });
      }

      expect(result.current.canUndo).toBe(true);

      let undoCount = 0;
      while (result.current.canUndo) {
        await act(async () => {
          await result.current.undo();
        });
        act(() => {
          jest.runAllTimers();
        });
        undoCount++;
      }

      // maxHistory=3이므로 최대 2번 undo 가능 (cursor 0까지)
      expect(undoCount).toBe(2);
    });
  });
});

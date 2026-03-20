/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { type UseSectionSaveStateParams, useSectionSaveState } from "../useSectionSaveState";

function renderSaveState(overrides: Partial<UseSectionSaveStateParams> = {}) {
  const onSaveStateChange = jest.fn();
  const initialProps: UseSectionSaveStateParams = {
    hasPendingChanges: false,
    isBusy: false,
    hasValidationIssues: false,
    validationIssueCount: 0,
    onSaveStateChange,
    ...overrides,
  };

  const result = renderHook((props: UseSectionSaveStateParams) => useSectionSaveState(props), {
    initialProps,
  });

  return { ...result, onSaveStateChange };
}

describe("useSectionSaveState", () => {
  describe("onSaveStateChange 보고", () => {
    // Given: 초기 렌더
    // Then: onSaveStateChange가 초기 상태로 호출된다
    it("초기 렌더 시 onSaveStateChange를 호출한다", () => {
      const { onSaveStateChange } = renderSaveState();

      expect(onSaveStateChange).toHaveBeenCalledTimes(1);
      expect(onSaveStateChange).toHaveBeenCalledWith({
        hasPendingChanges: false,
        isBusy: false,
        hasValidationIssues: false,
        validationIssueCount: 0,
      });
    });

    // Given: hasPendingChanges가 false에서 true로 변경
    // Then: onSaveStateChange가 새 상태로 호출된다
    it("hasPendingChanges 변경 시 재보고한다", () => {
      const { rerender, onSaveStateChange } = renderSaveState();

      act(() => {
        rerender({
          hasPendingChanges: true,
          isBusy: false,
          onSaveStateChange,
        });
      });

      expect(onSaveStateChange).toHaveBeenCalledTimes(2);
      expect(onSaveStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ hasPendingChanges: true }),
      );
    });

    // Given: isBusy가 변경
    // Then: onSaveStateChange가 재호출된다
    it("isBusy 변경 시 재보고한다", () => {
      const { rerender, onSaveStateChange } = renderSaveState();

      act(() => {
        rerender({
          hasPendingChanges: false,
          isBusy: true,
          onSaveStateChange,
        });
      });

      expect(onSaveStateChange).toHaveBeenCalledTimes(2);
      expect(onSaveStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ isBusy: true }));
    });

    // Given: 동일한 값으로 rerender
    // Then: onSaveStateChange를 다시 호출하지 않는다
    it("동일한 값이면 재보고하지 않는다", () => {
      const { rerender, onSaveStateChange } = renderSaveState();

      act(() => {
        rerender({
          hasPendingChanges: false,
          isBusy: false,
          hasValidationIssues: false,
          validationIssueCount: 0,
          onSaveStateChange,
        });
      });

      expect(onSaveStateChange).toHaveBeenCalledTimes(1);
    });

    // Given: validationIssueCount가 변경
    // Then: onSaveStateChange가 재호출된다
    it("validationIssueCount 변경 시 재보고한다", () => {
      const { rerender, onSaveStateChange } = renderSaveState();

      act(() => {
        rerender({
          hasPendingChanges: false,
          isBusy: false,
          hasValidationIssues: true,
          validationIssueCount: 2,
          onSaveStateChange,
        });
      });

      expect(onSaveStateChange).toHaveBeenCalledTimes(2);
      expect(onSaveStateChange).toHaveBeenLastCalledWith({
        hasPendingChanges: false,
        isBusy: false,
        hasValidationIssues: true,
        validationIssueCount: 2,
      });
    });

    // Given: onSaveStateChange가 undefined
    // Then: 에러 없이 동작한다
    it("onSaveStateChange가 없어도 에러 없이 동작한다", () => {
      expect(() => {
        renderSaveState({ onSaveStateChange: undefined });
      }).not.toThrow();
    });
  });

  describe("임페라티브 getter", () => {
    // Given: hasPendingChanges=false인 상태
    // Then: getHasPendingChanges()가 false를 반환한다
    it("getHasPendingChanges()가 현재 값을 반환한다", () => {
      const { result } = renderSaveState({ hasPendingChanges: false });

      expect(result.current.getHasPendingChanges()).toBe(false);
    });

    // Given: hasPendingChanges가 true로 변경
    // Then: getHasPendingChanges()가 즉시 true를 반환한다
    it("hasPendingChanges 변경 후 getHasPendingChanges()가 최신 값을 반환한다", () => {
      const { result, rerender, onSaveStateChange } = renderSaveState();

      act(() => {
        rerender({
          hasPendingChanges: true,
          isBusy: false,
          onSaveStateChange,
        });
      });

      expect(result.current.getHasPendingChanges()).toBe(true);
    });

    // Given: isBusy가 true로 변경
    // Then: getIsBusy()가 true를 반환한다
    it("getIsBusy()가 최신 값을 반환한다", () => {
      const { result, rerender, onSaveStateChange } = renderSaveState();

      act(() => {
        rerender({
          hasPendingChanges: false,
          isBusy: true,
          onSaveStateChange,
        });
      });

      expect(result.current.getIsBusy()).toBe(true);
    });

    // Given: 여러 번 rerender
    // Then: getter 참조가 안정적이다 (동일 함수)
    it("getter 참조가 안정적이다", () => {
      const { result, rerender, onSaveStateChange } = renderSaveState();

      const firstGetPending = result.current.getHasPendingChanges;
      const firstGetBusy = result.current.getIsBusy;

      act(() => {
        rerender({
          hasPendingChanges: true,
          isBusy: true,
          onSaveStateChange,
        });
      });

      expect(result.current.getHasPendingChanges).toBe(firstGetPending);
      expect(result.current.getIsBusy).toBe(firstGetBusy);
    });
  });

  describe("hasValidationIssues 기본값", () => {
    // Given: hasValidationIssues, validationIssueCount를 생략
    // Then: false, 0으로 보고된다
    it("생략 시 false, 0으로 보고된다", () => {
      const { onSaveStateChange } = renderSaveState();

      expect(onSaveStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          hasValidationIssues: false,
          validationIssueCount: 0,
        }),
      );
    });
  });
});

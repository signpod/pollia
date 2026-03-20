/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useFormDirtySnapshot } from "../useFormDirtySnapshot";

interface TestFormValues {
  title: string;
  description: string | undefined;
  startDate: Date | null;
  count: number;
  isActive: boolean;
}

const DEFAULT_VALUES: TestFormValues = {
  title: "Test",
  description: "<p>Hello</p>",
  startDate: new Date("2025-01-01T00:00:00.000Z"),
  count: 0,
  isActive: true,
};

function renderWithForm(defaultValues: TestFormValues = DEFAULT_VALUES) {
  return renderHook(() => {
    const form = useForm<TestFormValues>({ defaultValues });
    const snapshot = useFormDirtySnapshot(form);
    return { form, ...snapshot };
  });
}

describe("useFormDirtySnapshot", () => {
  describe("초기 상태", () => {
    // Given: 폼이 기본값으로 초기화
    // Then: hasPendingChanges = false
    it("초기 렌더 시 hasPendingChanges가 false이다", () => {
      const { result } = renderWithForm();
      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe("필드 변경 감지", () => {
    // Given: title 필드를 변경
    // Then: hasPendingChanges = true
    it("문자열 필드 변경 시 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("title", "Changed");
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });

    // Given: boolean 필드를 변경
    // Then: hasPendingChanges = true
    it("boolean 필드 변경 시 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("isActive", false);
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });

    // Given: 숫자 필드를 변경
    // Then: hasPendingChanges = true
    it("숫자 필드 변경 시 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("count", 5);
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });

    // Given: 값을 변경했다가 원래 값으로 되돌림
    // Then: hasPendingChanges = false
    it("원래 값으로 되돌리면 dirty가 해제된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("title", "Changed");
      });
      expect(result.current.hasPendingChanges).toBe(true);

      act(() => {
        result.current.form.setValue("title", "Test");
      });
      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe("Date 비교", () => {
    // Given: 동일한 timestamp의 새 Date 객체로 설정
    // Then: hasPendingChanges = false (참조가 아닌 값 비교)
    it("동일한 timestamp의 Date는 dirty로 판정하지 않는다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("startDate", new Date("2025-01-01T00:00:00.000Z"));
      });

      expect(result.current.hasPendingChanges).toBe(false);
    });

    // Given: 다른 timestamp의 Date로 설정
    // Then: hasPendingChanges = true
    it("다른 timestamp의 Date는 dirty로 판정한다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("startDate", new Date("2025-06-15T00:00:00.000Z"));
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });

    // Given: Date -> null 변경
    // Then: hasPendingChanges = true
    it("Date에서 null로 변경하면 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("startDate", null);
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });
  });

  describe("undefined / null 처리", () => {
    // Given: undefined 필드에 null을 설정
    // Then: 둘 다 null로 직렬화되므로 hasPendingChanges = false
    it("undefined와 null을 동일하게 취급한다", () => {
      const { result } = renderWithForm({
        ...DEFAULT_VALUES,
        description: undefined,
      });

      act(() => {
        result.current.form.setValue("description", undefined);
      });

      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe("markClean", () => {
    // Given: 필드를 변경한 후 markClean 호출
    // Then: hasPendingChanges = false
    it("markClean 호출 시 현재 값을 새 기준점으로 설정한다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("title", "Changed");
      });
      expect(result.current.hasPendingChanges).toBe(true);

      act(() => {
        result.current.markClean();
      });
      expect(result.current.hasPendingChanges).toBe(false);
    });

    // Given: markClean 후 다시 원래 값으로 변경
    // Then: hasPendingChanges = true (기준점이 변경되었으므로)
    it("markClean 후 이전 값으로 돌아가면 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("title", "Changed");
        result.current.markClean();
      });

      act(() => {
        result.current.form.setValue("title", "Test");
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });
  });

  describe("저장 패턴 (form.reset + markClean)", () => {
    // Given: 필드 변경 -> form.reset(savedValues) -> markClean
    // Then: hasPendingChanges = false
    it("저장 후 form.reset + markClean으로 dirty가 해제된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("title", "Saved Title");
      });
      expect(result.current.hasPendingChanges).toBe(true);

      act(() => {
        const savedValues = result.current.form.getValues();
        result.current.form.reset(savedValues);
        result.current.markClean();
      });

      expect(result.current.hasPendingChanges).toBe(false);
    });

    // Given: 저장 후 새로운 변경
    // Then: hasPendingChanges = true
    it("저장 후 다시 변경하면 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.setValue("title", "Saved Title");
        result.current.form.reset(result.current.form.getValues());
        result.current.markClean();
      });
      expect(result.current.hasPendingChanges).toBe(false);

      act(() => {
        result.current.form.setValue("title", "Another Change");
      });
      expect(result.current.hasPendingChanges).toBe(true);
    });
  });

  describe("드래프트 복원 패턴 (keepDefaultValues)", () => {
    // Given: form.reset(draftValues, { keepDefaultValues: true })
    // Then: hasPendingChanges = true (드래프트는 서버 대비 변경사항)
    it("드래프트 복원 후 dirty가 된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.reset(
          { ...DEFAULT_VALUES, title: "Draft Title" },
          { keepDefaultValues: true },
        );
      });

      expect(result.current.hasPendingChanges).toBe(true);
    });

    // Given: 드래프트 복원 -> 저장 (form.reset + markClean) -> 비변경
    // Then: hasPendingChanges = false
    it("드래프트 복원 후 저장하면 dirty가 해제된다", () => {
      const { result } = renderWithForm();

      act(() => {
        result.current.form.reset(
          { ...DEFAULT_VALUES, title: "Draft Title" },
          { keepDefaultValues: true },
        );
      });
      expect(result.current.hasPendingChanges).toBe(true);

      act(() => {
        const savedValues = result.current.form.getValues();
        result.current.form.reset(savedValues);
        result.current.markClean();
      });
      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe("markClean 참조 안정성", () => {
    // Given: 여러 번 rerender
    // Then: markClean 함수 참조가 동일하다
    it("markClean 참조가 안정적이다", () => {
      const { result, rerender } = renderWithForm();

      const first = result.current.markClean;

      act(() => {
        result.current.form.setValue("title", "Changed");
      });

      rerender();

      expect(result.current.markClean).toBe(first);
    });
  });
});

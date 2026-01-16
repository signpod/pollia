import { type OptionInput, classifyOptions } from "./classifyOptions";

describe("classifyOptions", () => {
  describe("기본 테스트", () => {
    it("id가 있고 기존에 존재하는 옵션은 toUpdate에 포함된다", () => {
      // Given
      const existingIds = new Set(["opt-1", "opt-2"]);
      const options: OptionInput[] = [
        { id: "opt-1", title: "수정된 옵션1", order: 0 },
        { id: "opt-2", title: "수정된 옵션2", order: 1 },
      ];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(2);
      expect(result.toUpdate.map(o => o.id)).toEqual(["opt-1", "opt-2"]);
      expect(result.toCreate).toHaveLength(0);
      expect(result.toDeleteIds).toHaveLength(0);
    });

    it("id가 없는 옵션은 toCreate에 포함된다", () => {
      // Given
      const existingIds = new Set(["opt-1"]);
      const options: OptionInput[] = [
        { id: "opt-1", title: "기존 옵션", order: 0 },
        { title: "새 옵션", order: 1 },
      ];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(1);
      expect(result.toCreate).toHaveLength(1);
      expect(result.toCreate[0]?.title).toBe("새 옵션");
      expect(result.toDeleteIds).toHaveLength(0);
    });

    it("전달되지 않은 기존 옵션 id는 toDeleteIds에 포함된다", () => {
      // Given
      const existingIds = new Set(["opt-1", "opt-2", "opt-3"]);
      const options: OptionInput[] = [{ id: "opt-1", title: "유지할 옵션", order: 0 }];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(1);
      expect(result.toCreate).toHaveLength(0);
      expect(result.toDeleteIds).toEqual(["opt-2", "opt-3"]);
    });
  });

  describe("경계값 테스트", () => {
    it("빈 옵션 배열이면 모든 기존 id가 toDeleteIds에 포함된다", () => {
      // Given
      const existingIds = new Set(["opt-1", "opt-2"]);
      const options: OptionInput[] = [];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(0);
      expect(result.toCreate).toHaveLength(0);
      expect(result.toDeleteIds).toEqual(["opt-1", "opt-2"]);
    });

    it("기존 옵션이 없으면 toDeleteIds는 빈 배열이다", () => {
      // Given
      const existingIds = new Set<string>();
      const options: OptionInput[] = [
        { title: "새 옵션1", order: 0 },
        { title: "새 옵션2", order: 1 },
      ];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(0);
      expect(result.toCreate).toHaveLength(2);
      expect(result.toDeleteIds).toHaveLength(0);
    });

    it("모든 옵션에 기존 id가 있으면 toCreate와 toDeleteIds는 빈 배열이다", () => {
      // Given
      const existingIds = new Set(["opt-1", "opt-2"]);
      const options: OptionInput[] = [
        { id: "opt-1", title: "옵션1", order: 0 },
        { id: "opt-2", title: "옵션2", order: 1 },
      ];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(2);
      expect(result.toCreate).toHaveLength(0);
      expect(result.toDeleteIds).toHaveLength(0);
    });

    it("복합 케이스: 업데이트, 생성, 삭제가 동시에 분류된다", () => {
      // Given
      const existingIds = new Set(["opt-1", "opt-2", "opt-3"]);
      const options: OptionInput[] = [
        { id: "opt-1", title: "업데이트할 옵션", order: 0 },
        { title: "새로 추가할 옵션", order: 1 },
      ];

      // When
      const result = classifyOptions(existingIds, options);

      // Then
      expect(result.toUpdate).toHaveLength(1);
      expect(result.toUpdate[0]?.id).toBe("opt-1");
      expect(result.toCreate).toHaveLength(1);
      expect(result.toCreate[0]?.title).toBe("새로 추가할 옵션");
      expect(result.toDeleteIds).toEqual(["opt-2", "opt-3"]);
    });
  });
});

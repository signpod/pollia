import type { Edge, Node } from "@xyflow/react";
import { validateFlowGraph } from "../flowValidation";

describe("validateFlowGraph - 블랙박스 테스트", () => {
  const createNode = (id: string, type: string): Node => ({
    id,
    type,
    position: { x: 0, y: 0 },
    data: {},
  });

  const createEdge = (source: string, target: string, sourceHandle?: string): Edge => ({
    id: `${source}-${target}`,
    source,
    target,
    ...(sourceHandle && { sourceHandle }),
  });

  describe("유효한 플로우", () => {
    it("Start → Action → Completion 구조는 유효해야 한다", () => {
      // Given: 완전히 연결된 플로우
      const nodes = [
        createNode("start", "start"),
        createNode("action-1", "action"),
        createNode("completion-1", "completion"),
      ];
      const edges = [createEdge("start", "action-1"), createEdge("action-1", "completion-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: 오류가 없어야 함
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.unreachableNodes.size).toBe(0);
      expect(result.deadEndNodes.size).toBe(0);
    });

    it("Branch를 포함한 플로우도 유효해야 한다", () => {
      // Given: Start → Branch(opt1→A, opt2→B) → Completions
      const nodes = [
        createNode("start", "start"),
        createNode("branch-1", "branch-action"),
        createNode("action-a", "action"),
        createNode("action-b", "action"),
        createNode("completion-a", "completion"),
        createNode("completion-b", "completion"),
      ];
      const edges = [
        createEdge("start", "branch-1"),
        createEdge("branch-1", "action-a", "opt1"),
        createEdge("branch-1", "action-b", "opt2"),
        createEdge("action-a", "completion-a"),
        createEdge("action-b", "completion-b"),
      ];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: 오류가 없어야 함
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Missing Entry (시작 액션 미설정)", () => {
    it("Start 노드가 없으면 missing-entry 오류가 발생해야 한다", () => {
      // Given: Start 노드 없음
      const nodes = [createNode("action-1", "action"), createNode("completion-1", "completion")];
      const edges = [createEdge("action-1", "completion-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: missing-entry 오류
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe("missing-entry");
      expect(result.errors[0]?.nodeId).toBe("start");
    });

    it("Start 노드는 있지만 연결이 없으면 missing-entry 오류가 발생해야 한다", () => {
      // Given: Start 노드는 있지만 나가는 엣지 없음
      const nodes = [
        createNode("start", "start"),
        createNode("action-1", "action"),
        createNode("completion-1", "completion"),
      ];
      const edges = [createEdge("action-1", "completion-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: missing-entry 오류
      expect(result.isValid).toBe(false);
      const missingEntryError = result.errors.find(e => e.type === "missing-entry");
      expect(missingEntryError).toBeDefined();
      expect(missingEntryError?.message).toContain("시작 액션");
    });
  });

  describe("Unreachable Nodes (도달 불가능한 노드)", () => {
    it("Start에서 도달할 수 없는 노드는 unreachable 오류가 발생해야 한다", () => {
      // Given: ActionB는 고아 노드
      const nodes = [
        createNode("start", "start"),
        createNode("action-a", "action"),
        createNode("action-b", "action"), // 도달 불가
        createNode("completion-1", "completion"),
      ];
      const edges = [createEdge("start", "action-a"), createEdge("action-a", "completion-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: unreachable 오류
      expect(result.isValid).toBe(false);
      expect(result.unreachableNodes.has("action-b")).toBe(true);

      const unreachableError = result.errors.find(
        e => e.type === "unreachable" && e.nodeId === "action-b",
      );
      expect(unreachableError).toBeDefined();
      expect(unreachableError?.message).toContain("도달할 수 없습니다");
    });

    it("여러 개의 unreachable 노드를 모두 감지해야 한다", () => {
      // Given: ActionB, ActionC 둘 다 고아 노드
      const nodes = [
        createNode("start", "start"),
        createNode("action-a", "action"),
        createNode("action-b", "action"), // 도달 불가
        createNode("action-c", "action"), // 도달 불가
        createNode("completion-1", "completion"),
      ];
      const edges = [createEdge("start", "action-a"), createEdge("action-a", "completion-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: 2개의 unreachable 오류
      expect(result.unreachableNodes.size).toBe(2);
      expect(result.unreachableNodes.has("action-b")).toBe(true);
      expect(result.unreachableNodes.has("action-c")).toBe(true);

      const unreachableErrors = result.errors.filter(e => e.type === "unreachable");
      expect(unreachableErrors).toHaveLength(2);
    });

    it("Completion 노드도 unreachable 감지 대상이어야 한다", () => {
      // Given: CompletionB는 도달 불가
      const nodes = [
        createNode("start", "start"),
        createNode("action-1", "action"),
        createNode("completion-a", "completion"),
        createNode("completion-b", "completion"), // 도달 불가
      ];
      const edges = [createEdge("start", "action-1"), createEdge("action-1", "completion-a")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: completion-b unreachable
      expect(result.unreachableNodes.has("completion-b")).toBe(true);
    });
  });

  describe("Dead End (다음 단계 미설정)", () => {
    it("Action 노드가 아무곳으로도 연결되지 않으면 dead-end 오류가 발생해야 한다", () => {
      // Given: ActionA는 다음 단계가 없음
      const nodes = [
        createNode("start", "start"),
        createNode("action-a", "action"), // dead-end
        createNode("completion-1", "completion"),
      ];
      const edges = [createEdge("start", "action-a")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: dead-end 오류
      expect(result.isValid).toBe(false);
      expect(result.deadEndNodes.has("action-a")).toBe(true);

      const deadEndError = result.errors.find(
        e => e.type === "dead-end" && e.nodeId === "action-a",
      );
      expect(deadEndError).toBeDefined();
      expect(deadEndError?.message).toContain("다음 단계");
    });

    it("Branch Action도 나가는 엣지가 없으면 dead-end 오류가 발생해야 한다", () => {
      // Given: Branch는 있지만 옵션 연결이 없음
      const nodes = [
        createNode("start", "start"),
        createNode("branch-1", "branch-action"), // dead-end
      ];
      const edges = [createEdge("start", "branch-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: dead-end 오류
      expect(result.deadEndNodes.has("branch-1")).toBe(true);
    });

    it("Completion 노드는 dead-end 검사 대상이 아니어야 한다", () => {
      // Given: Completion은 나가는 엣지가 없는 게 정상
      const nodes = [
        createNode("start", "start"),
        createNode("action-1", "action"),
        createNode("completion-1", "completion"),
      ];
      const edges = [createEdge("start", "action-1"), createEdge("action-1", "completion-1")];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: Completion은 dead-end가 아님
      expect(result.deadEndNodes.has("completion-1")).toBe(false);
      expect(result.isValid).toBe(true);
    });
  });

  describe("복합 오류 케이스", () => {
    it("여러 종류의 오류가 동시에 발생할 수 있어야 한다", () => {
      // Given: missing-entry + unreachable + dead-end
      const nodes = [
        createNode("start", "start"),
        createNode("action-a", "action"), // dead-end
        createNode("action-b", "action"), // unreachable
        createNode("completion-1", "completion"),
      ];
      const edges = [
        createEdge("start", "action-a"),
        // action-a는 나가는 엣지 없음 (dead-end)
        // action-b는 들어오는 엣지 없음 (unreachable)
      ];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: 여러 오류 감지
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.deadEndNodes.has("action-a")).toBe(true);
      expect(result.unreachableNodes.has("action-b")).toBe(true);
    });
  });

  describe("엣지 케이스", () => {
    it("빈 그래프는 missing-entry 오류만 발생해야 한다", () => {
      // Given: 노드와 엣지가 모두 비어있음
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: missing-entry 오류
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe("missing-entry");
    });

    it("Start 노드만 있는 경우는 missing-entry 오류가 발생해야 한다", () => {
      // Given: Start만 있고 연결 없음
      const nodes = [createNode("start", "start")];
      const edges: Edge[] = [];

      // When
      const result = validateFlowGraph(nodes, edges);

      // Then: missing-entry 오류
      expect(result.isValid).toBe(false);
      const missingEntryError = result.errors.find(e => e.type === "missing-entry");
      expect(missingEntryError).toBeDefined();
    });
  });
});

import type { Action, Mission, MissionCompletion } from "@prisma/client";
import { transformToFlowGraph } from "../flowTransform";
import type { FlowGraphData } from "../flowTransform";

describe("transformToFlowGraph - 블랙박스 테스트", () => {
  const createMission = (overrides?: Partial<Mission>): Mission => ({
    id: "mission-1",
    title: "Test Mission",
    description: null,
    imageUrl: null,
    brandLogoUrl: null,
    estimatedMinutes: null,
    deadline: null,
    isActive: true,
    maxParticipants: null,
    creatorId: "creator-1",
    rewardId: null,
    eventId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    target: null,
    type: "GENERAL",
    category: "EVENT",
    password: null,
    entryActionId: null,
    imageFileUploadId: null,
    brandLogoFileUploadId: null,
    ...overrides,
  });

  const createAction = (overrides?: Partial<Action>): Action => ({
    id: "action-1",
    title: "Test Action",
    description: null,
    imageUrl: null,
    type: "MULTIPLE_CHOICE",
    order: null,
    maxSelections: null,
    isRequired: true,
    hasOther: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    missionId: "mission-1",
    nextActionId: null,
    nextCompletionId: null,
    imageFileUploadId: null,
    ...overrides,
  });

  const createCompletion = (overrides?: Partial<MissionCompletion>): MissionCompletion => ({
    id: "completion-1",
    title: "Test Completion",
    description: "Done",
    imageUrl: null,
    links: null,
    missionId: "mission-1",
    imageFileUploadId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("빈 플로우", () => {
    it("Entry Action이 없는 경우, Start 노드만 생성되어야 한다", async () => {
      // Given: Entry Action이 없는 미션
      const mission = createMission({ entryActionId: null });
      const data: FlowGraphData = {
        mission,
        actions: [],
        completions: [],
      };

      // When: 플로우 그래프로 변환
      const result = await transformToFlowGraph(data);

      // Then: Start 노드만 있어야 함
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.id).toBe("start");
      expect(result.nodes[0]?.type).toBe("start");
      expect(result.nodes[0]?.data.mission).toBe(mission);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe("단순 선형 플로우", () => {
    it("Action → Completion 순서로 노드와 엣지가 생성되어야 한다", async () => {
      // Given: A → Completion 플로우
      const action = createAction({
        id: "action-1",
        nextCompletionId: "completion-1",
      });
      const completion = createCompletion({ id: "completion-1" });
      const mission = createMission({ entryActionId: "action-1" });

      const data: FlowGraphData = {
        mission,
        actions: [{ ...action, options: [] }],
        completions: [completion],
      };

      // When
      const result = await transformToFlowGraph(data);

      // Then: Start, Action, Completion 노드가 생성되어야 함
      expect(result.nodes).toHaveLength(3);
      expect(result.nodes.map(n => n.id)).toEqual(["start", "action-1", "completion-1"]);

      // Then: Start → Action, Action → Completion 엣지가 생성되어야 함
      expect(result.edges).toHaveLength(2);
      expect(result.edges).toEqual([
        expect.objectContaining({ source: "start", target: "action-1" }),
        expect.objectContaining({ source: "action-1", target: "completion-1" }),
      ]);
    });

    it("Action → Action → Completion 체인이 올바르게 연결되어야 한다", async () => {
      // Given: A → B → Completion
      const actionA = createAction({
        id: "action-a",
        nextActionId: "action-b",
      });
      const actionB = createAction({
        id: "action-b",
        nextCompletionId: "completion-1",
      });
      const completion = createCompletion({ id: "completion-1" });
      const mission = createMission({ entryActionId: "action-a" });

      const data: FlowGraphData = {
        mission,
        actions: [
          { ...actionA, options: [] },
          { ...actionB, options: [] },
        ],
        completions: [completion],
      };

      // When
      const result = await transformToFlowGraph(data);

      // Then: 4개 노드 (Start, A, B, Completion)
      expect(result.nodes).toHaveLength(4);
      expect(result.nodes.map(n => n.id)).toEqual([
        "start",
        "action-a",
        "action-b",
        "completion-1",
      ]);

      // Then: 3개 엣지 (Start→A, A→B, B→Completion)
      expect(result.edges).toHaveLength(3);
      expect(result.edges).toEqual([
        expect.objectContaining({ source: "start", target: "action-a" }),
        expect.objectContaining({ source: "action-a", target: "action-b" }),
        expect.objectContaining({ source: "action-b", target: "completion-1" }),
      ]);
    });
  });

  describe("분기 플로우 (Branch Action)", () => {
    it("Branch Action의 각 옵션이 서로 다른 타겟으로 연결되어야 한다", async () => {
      // Given: Branch(opt1→ActionA, opt2→ActionB)
      const branchAction = createAction({
        id: "branch-1",
        type: "BRANCH",
      });
      const actionA = createAction({ id: "action-a" });
      const actionB = createAction({ id: "action-b" });
      const mission = createMission({ entryActionId: "branch-1" });

      const data: FlowGraphData = {
        mission,
        actions: [
          {
            ...branchAction,
            options: [
              {
                id: "option-1",
                title: "Option 1",
                description: null,
                imageUrl: null,
                order: 0,
                actionId: "branch-1",
                fileUploadId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                nextActionId: "action-a",
                nextCompletionId: null,
              },
              {
                id: "option-2",
                title: "Option 2",
                description: null,
                imageUrl: null,
                order: 1,
                actionId: "branch-1",
                fileUploadId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                nextActionId: "action-b",
                nextCompletionId: null,
              },
            ],
          },
          { ...actionA, options: [] },
          { ...actionB, options: [] },
        ],
        completions: [],
      };

      // When
      const result = await transformToFlowGraph(data);

      // Then: 4개 노드 (Start, Branch, ActionA, ActionB)
      expect(result.nodes).toHaveLength(4);
      expect(result.nodes.map(n => n.id)).toEqual(["start", "branch-1", "action-a", "action-b"]);

      // Then: Branch의 타입이 "branch-action"이어야 함
      const branchNode = result.nodes.find(n => n.id === "branch-1");
      expect(branchNode?.type).toBe("branch-action");

      // Then: 3개 엣지 (Start→Branch, Branch(opt1)→A, Branch(opt2)→B)
      expect(result.edges).toHaveLength(3);
      expect(result.edges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ source: "start", target: "branch-1" }),
          expect.objectContaining({
            source: "branch-1",
            target: "action-a",
            sourceHandle: "option-1",
          }),
          expect.objectContaining({
            source: "branch-1",
            target: "action-b",
            sourceHandle: "option-2",
          }),
        ]),
      );
    });

    it("Branch의 옵션이 Completion을 가리킬 수 있어야 한다", async () => {
      // Given: Branch(opt1→CompletionA, opt2→CompletionB)
      const branchAction = createAction({
        id: "branch-1",
        type: "BRANCH",
      });
      const completionA = createCompletion({ id: "completion-a" });
      const completionB = createCompletion({ id: "completion-b" });
      const mission = createMission({ entryActionId: "branch-1" });

      const data: FlowGraphData = {
        mission,
        actions: [
          {
            ...branchAction,
            options: [
              {
                id: "option-1",
                title: "Option 1",
                description: null,
                imageUrl: null,
                order: 0,
                actionId: "branch-1",
                fileUploadId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                nextActionId: null,
                nextCompletionId: "completion-a",
              },
              {
                id: "option-2",
                title: "Option 2",
                description: null,
                imageUrl: null,
                order: 1,
                actionId: "branch-1",
                fileUploadId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                nextActionId: null,
                nextCompletionId: "completion-b",
              },
            ],
          },
        ],
        completions: [completionA, completionB],
      };

      // When
      const result = await transformToFlowGraph(data);

      // Then: Branch → 두 Completion으로 연결
      expect(result.edges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source: "branch-1",
            target: "completion-a",
            sourceHandle: "option-1",
          }),
          expect.objectContaining({
            source: "branch-1",
            target: "completion-b",
            sourceHandle: "option-2",
          }),
        ]),
      );
    });
  });

  describe("도달 불가능한 노드 (Unreachable)", () => {
    it("Entry Action과 연결되지 않은 Action은 그래프에 포함되지 않는다", async () => {
      // Given: ActionA는 연결됨, ActionB는 고아 노드
      const actionA = createAction({
        id: "action-a",
        nextCompletionId: "completion-1",
      });
      const actionB = createAction({ id: "action-b" }); // 연결 안 됨
      const completion = createCompletion({ id: "completion-1" });
      const mission = createMission({ entryActionId: "action-a" });

      const data: FlowGraphData = {
        mission,
        actions: [
          { ...actionA, options: [] },
          { ...actionB, options: [] },
        ],
        completions: [completion],
      };

      // When
      const result = await transformToFlowGraph(data);

      // Then: 연결된 노드만 포함되어야 함 (Start, ActionA, Completion)
      expect(result.nodes).toHaveLength(3);
      expect(result.nodes.map(n => n.id)).not.toContain("action-b");

      // Then: ActionB로 연결되는 엣지도 없어야 함
      const edgesToB = result.edges.filter(e => e.target === "action-b");
      expect(edgesToB).toHaveLength(0);
    });

    it("연결되지 않은 Completion은 그래프에 포함되지 않는다", async () => {
      // Given: CompletionA는 연결됨, CompletionB는 고아 노드
      const action = createAction({
        id: "action-1",
        nextCompletionId: "completion-a",
      });
      const completionA = createCompletion({ id: "completion-a" });
      const completionB = createCompletion({ id: "completion-b" }); // 연결 안 됨
      const mission = createMission({ entryActionId: "action-1" });

      const data: FlowGraphData = {
        mission,
        actions: [{ ...action, options: [] }],
        completions: [completionA, completionB],
      };

      // When
      const result = await transformToFlowGraph(data);

      // Then: CompletionB는 포함되지 않아야 함
      expect(result.nodes.map(n => n.id)).not.toContain("completion-b");

      // Then: CompletionB로 연결되는 엣지도 없어야 함
      const edgesToB = result.edges.filter(e => e.target === "completion-b");
      expect(edgesToB).toHaveLength(0);
    });
  });

  describe("노드 타입 구분", () => {
    it("Start 노드는 'start' 타입이어야 한다", async () => {
      const mission = createMission();
      const data: FlowGraphData = { mission, actions: [], completions: [] };

      const result = await transformToFlowGraph(data);

      const startNode = result.nodes.find(n => n.id === "start");
      expect(startNode?.type).toBe("start");
    });

    it("일반 Action은 'action' 타입이어야 한다", async () => {
      const action = createAction({ id: "action-1", type: "MULTIPLE_CHOICE" });
      const mission = createMission({ entryActionId: "action-1" });
      const data: FlowGraphData = {
        mission,
        actions: [{ ...action, options: [] }],
        completions: [],
      };

      const result = await transformToFlowGraph(data);

      const actionNode = result.nodes.find(n => n.id === "action-1");
      expect(actionNode?.type).toBe("action");
    });

    it("Branch Action은 'branch-action' 타입이어야 한다", async () => {
      const action = createAction({ id: "branch-1", type: "BRANCH" });
      const mission = createMission({ entryActionId: "branch-1" });
      const data: FlowGraphData = {
        mission,
        actions: [{ ...action, options: [] }],
        completions: [],
      };

      const result = await transformToFlowGraph(data);

      const branchNode = result.nodes.find(n => n.id === "branch-1");
      expect(branchNode?.type).toBe("branch-action");
    });

    it("Completion은 'completion' 타입이어야 한다", async () => {
      const action = createAction({
        id: "action-1",
        nextCompletionId: "completion-1",
      });
      const completion = createCompletion({ id: "completion-1" });
      const mission = createMission({ entryActionId: "action-1" });
      const data: FlowGraphData = {
        mission,
        actions: [{ ...action, options: [] }],
        completions: [completion],
      };

      const result = await transformToFlowGraph(data);

      const completionNode = result.nodes.find(n => n.id === "completion-1");
      expect(completionNode?.type).toBe("completion");
    });
  });
});

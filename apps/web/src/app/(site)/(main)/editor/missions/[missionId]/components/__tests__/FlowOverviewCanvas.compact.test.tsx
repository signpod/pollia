/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { FlowOverviewCanvas } from "../FlowOverviewCanvas";
import type { EditorFlowAnalysisResult } from "../editor-publish-flow-validation";

jest.mock("@xyflow/react/dist/style.css", () => ({}));

jest.mock("@xyflow/react", () => ({
  Background: () => <div data-testid="flow-background" />,
  Controls: () => <div data-testid="flow-controls" />,
  Handle: () => null,
  MiniMap: () => <div data-testid="flow-minimap" />,
  Position: { Top: "top", Bottom: "bottom" },
  ReactFlow: ({ children }: { children: ReactNode }) => (
    <div data-testid="flow-react">{children}</div>
  ),
  ReactFlowProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="flow-provider">{children}</div>
  ),
}));

const analysis: EditorFlowAnalysisResult = {
  state: {
    entryActionId: "action-1",
    actions: [
      {
        id: "action-1",
        type: "SUBJECTIVE",
        title: "질문",
        nextActionId: null,
        nextCompletionId: "completion-1",
        options: [],
        isDraft: false,
      },
    ],
    completions: [
      {
        id: "completion-1",
        title: "완료",
        isDraft: false,
      },
    ],
  },
  issues: [],
  outgoingByActionId: new Map(),
  reachableNodeIds: new Set(["action-1", "completion-1"]),
  connections: [
    {
      id: "action-1:completion-1",
      source: "action-1",
      target: "completion-1",
      label: null,
      isBranchOption: false,
    },
  ],
};

describe("FlowOverviewCanvas compact variant", () => {
  it("default 모드에서는 MiniMap/Controls를 렌더한다", () => {
    render(<FlowOverviewCanvas analysis={analysis} />);

    expect(screen.getByTestId("flow-minimap")).not.toBeNull();
    expect(screen.getByTestId("flow-controls")).not.toBeNull();
  });

  it("compact 모드에서는 MiniMap/Controls를 렌더하지 않는다", () => {
    render(<FlowOverviewCanvas analysis={analysis} variant="compact" />);

    expect(screen.queryByTestId("flow-minimap")).toBeNull();
    expect(screen.queryByTestId("flow-controls")).toBeNull();
  });
});

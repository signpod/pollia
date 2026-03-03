/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { FlowOverviewCanvas } from "../FlowOverviewCanvas";
import type { EditorFlowAnalysisResult } from "../editor-publish-flow-validation";

jest.mock("@xyflow/react/dist/style.css", () => ({}));

const fitViewMock = jest.fn();
let resizeObserverCallback: ResizeObserverCallback | null = null;

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeObserverCallback = callback;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

jest.mock("@xyflow/react", () => {
  const React = require("react");

  return {
    Background: () => <div data-testid="flow-background" />,
    Controls: () => <div data-testid="flow-controls" />,
    Handle: () => null,
    MiniMap: () => <div data-testid="flow-minimap" />,
    Position: { Top: "top", Bottom: "bottom" },
    ReactFlow: ({
      children,
      onInit,
    }: {
      children: ReactNode;
      onInit?: (instance: unknown) => void;
    }) => {
      React.useEffect(() => {
        onInit?.({
          fitView: fitViewMock,
        });
      }, [onInit]);

      return <div data-testid="flow-react">{children}</div>;
    },
    ReactFlowProvider: ({ children }: { children: ReactNode }) => (
      <div data-testid="flow-provider">{children}</div>
    ),
  };
});

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
  let requestAnimationFrameSpy: jest.SpyInstance<number, [FrameRequestCallback]>;

  beforeEach(() => {
    fitViewMock.mockClear();
    resizeObserverCallback = null;
    requestAnimationFrameSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(callback => {
        callback(0);
        return 1;
      });
  });

  afterEach(() => {
    requestAnimationFrameSpy.mockRestore();
  });

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

  it("onInit 및 리사이즈 시 fitView를 재호출한다", () => {
    render(<FlowOverviewCanvas analysis={analysis} variant="compact" />);

    expect(fitViewMock).toHaveBeenCalled();

    if (!resizeObserverCallback) {
      throw new Error("ResizeObserver callback is not registered");
    }

    act(() => {
      resizeObserverCallback?.([], {} as ResizeObserver);
    });

    expect(fitViewMock.mock.calls.length).toBeGreaterThan(1);
  });
});

"use client";

import {
  Background,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type NodeProps,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  ReactFlowProvider,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { type FlowOverviewNode, buildFlowOverviewElements } from "./editor-flow-overview.utils";
import type { EditorFlowAnalysisResult } from "./editor-publish-flow-validation";
import "@xyflow/react/dist/style.css";

interface FlowOverviewCanvasProps {
  analysis: EditorFlowAnalysisResult;
  variant?: "default" | "compact";
}

function StatusBadge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {text}
    </span>
  );
}

function FlowOverviewNodeCard({ data }: NodeProps<FlowOverviewNode>) {
  const isStart = data.kind === "start";
  const isCompletion = data.kind === "completion";
  const showSourceHandle = isStart || data.kind === "action" || data.kind === "branch-action";
  const isCompact = Boolean(data.compact);

  return (
    <div
      className={`${isCompact ? "min-w-[170px] max-w-[220px] px-3 py-2.5" : "min-w-[230px] max-w-[290px] px-4 py-3"} rounded-xl border bg-white shadow-sm ${
        data.isUnreachable ? "opacity-50 grayscale" : ""
      } ${
        data.isDeadEnd
          ? "border-red-300 bg-red-50"
          : isCompletion
            ? "border-emerald-300 bg-emerald-50"
            : isStart
              ? "border-sky-300 bg-sky-50"
              : "border-zinc-200"
      }`}
    >
      {!isStart && <Handle type="target" position={Position.Top} isConnectable={false} />}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {data.subtitle}
      </p>
      <p
        className={`${isCompact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"} mt-1 font-semibold text-zinc-900`}
      >
        {data.title}
      </p>
      {(data.isMissingEntry || data.isDeadEnd || data.isUnreachable) && (
        <div className={`${isCompact ? "mt-1.5 gap-1" : "mt-2 gap-1.5"} flex flex-wrap`}>
          {data.isMissingEntry && (
            <StatusBadge
              text="시작 미설정"
              className="bg-amber-100 text-amber-800 ring-1 ring-amber-200"
            />
          )}
          {data.isDeadEnd && (
            <StatusBadge text="Dead-end" className="bg-red-100 text-red-700 ring-1 ring-red-200" />
          )}
          {data.isUnreachable && (
            <StatusBadge
              text="도달 불가"
              className="bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300"
            />
          )}
        </div>
      )}
      {showSourceHandle && (
        <Handle type="source" position={Position.Bottom} isConnectable={false} />
      )}
    </div>
  );
}

export function FlowOverviewCanvas({ analysis, variant = "default" }: FlowOverviewCanvasProps) {
  const isCompact = variant === "compact";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flowInstanceRef = useRef<ReactFlowInstance<FlowOverviewNode, Edge> | null>(null);
  const { nodes, edges } = useMemo(
    () => buildFlowOverviewElements(analysis, { compact: isCompact }),
    [analysis, isCompact],
  );
  const fitViewPadding = isCompact ? 0.16 : 0.24;

  const fitToView = useCallback(() => {
    if (!flowInstanceRef.current) {
      return;
    }

    flowInstanceRef.current.fitView({ padding: fitViewPadding });
  }, [fitViewPadding]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance<FlowOverviewNode, Edge>) => {
      flowInstanceRef.current = instance;
      window.requestAnimationFrame(() => {
        fitToView();
      });
    },
    [fitToView],
  );

  useEffect(() => {
    window.requestAnimationFrame(() => {
      fitToView();
    });
  }, [fitToView, nodes, edges]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        fitToView();
      });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [fitToView]);

  const nodeTypes = useMemo(
    () => ({
      "overview-node": FlowOverviewNodeCard,
    }),
    [],
  );

  return (
    <ReactFlowProvider>
      <div
        ref={containerRef}
        className="h-full min-h-[300px] w-full rounded-xl border border-zinc-200 bg-zinc-50"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          onInit={handleInit}
          fitViewOptions={{ padding: fitViewPadding }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#e4e4e7" />
          {!isCompact && <MiniMap pannable zoomable />}
          {!isCompact && <Controls showInteractive={false} />}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

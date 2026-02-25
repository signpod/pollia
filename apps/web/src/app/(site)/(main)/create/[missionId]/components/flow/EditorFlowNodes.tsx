"use client";

import { Typo } from "@repo/ui/components";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

export function StartNode(_props: NodeProps) {
  return (
    <div className="flex h-14 w-40 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50">
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2" />
      <Typo.Body size="small" className="font-medium text-zinc-600">
        시작
      </Typo.Body>
    </div>
  );
}

export function ActionNode(props: NodeProps) {
  const data = props.data as { label?: string };
  return (
    <div className="flex h-14 w-40 items-center justify-center rounded-lg border border-violet-200 bg-violet-50/80">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2" />
      <Typo.Body size="small" className="truncate px-2 font-medium text-violet-900">
        {data?.label ?? "질문"}
      </Typo.Body>
    </div>
  );
}

export function CompletionNode(props: NodeProps) {
  const data = props.data as { label?: string };
  return (
    <div className="flex h-14 w-40 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/80">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2" />
      <Typo.Body size="small" className="truncate px-2 font-medium text-emerald-900">
        {data?.label ?? "결과"}
      </Typo.Body>
    </div>
  );
}

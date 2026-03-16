"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "./FlowCanvas";

interface FlowEditorProps {
  missionId: string;
}

export function FlowEditor({ missionId }: FlowEditorProps) {
  return (
    <div className="h-[calc(100vh-300px)] w-full border rounded-lg overflow-hidden">
      <ReactFlowProvider>
        <FlowCanvas missionId={missionId} />
      </ReactFlowProvider>
    </div>
  );
}

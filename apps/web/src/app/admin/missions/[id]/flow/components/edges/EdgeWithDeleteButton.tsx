"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "@xyflow/react";
import { X } from "lucide-react";

export function EdgeWithDeleteButton(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = async () => {
    if (
      data &&
      typeof data === "object" &&
      "onDelete" in data &&
      typeof data.onDelete === "function"
    ) {
      try {
        await data.onDelete(id);
      } catch (error) {
        console.error("엣지 삭제 실패:", error);
      }
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <Button
            size="icon"
            variant="destructive"
            className="h-7 w-7 rounded-full shadow-lg"
            onClick={e => {
              e.stopPropagation();
              handleDelete();
            }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

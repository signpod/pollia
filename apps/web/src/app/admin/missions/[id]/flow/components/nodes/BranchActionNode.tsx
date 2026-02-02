import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import type { Action, ActionOption } from "@prisma/client";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";

type BranchActionNodeData = {
  action?: Action & { options: ActionOption[] };
};

export type BranchActionNodeType = Node<BranchActionNodeData, "branch-action">;

export function BranchActionNode({ data }: NodeProps<BranchActionNodeType>) {
  const { action } = data;

  if (!action) return null;

  return (
    <Card className="min-w-[350px]">
      <Handle type="target" position={Position.Top} />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="size-4" />
          <span className="text-sm font-medium">분기</span>
        </div>
        <p className="text-sm mb-4">{action.title}</p>
        <div className="grid grid-cols-2 gap-3">
          {action.options.map((option, index) => (
            <div key={option.id} className="relative border rounded p-3">
              <p className="text-xs font-medium mb-1">옵션 {index + 1}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{option.title}</p>
              <Handle
                type="source"
                position={Position.Bottom}
                id={option.id}
                style={{ left: index === 0 ? "25%" : "75%" }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

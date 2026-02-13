import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import type { MissionCompletion } from "@prisma/client";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { CheckCircle } from "lucide-react";

type CompletionNodeData = {
  completion?: MissionCompletion;
};

export type CompletionNodeType = Node<CompletionNodeData, "completion">;

export function CompletionNode({ data }: NodeProps<CompletionNodeType>) {
  const { completion } = data;

  if (!completion) return null;

  return (
    <Card className="min-w-[200px] border-green-500 bg-green-50">
      <Handle type="target" position={Position.Top} />
      <CardContent className="px-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="size-4 text-green-600" />
          <span className="text-sm font-medium">완료 화면</span>
        </div>
        <p className="text-sm mt-2">{completion.title}</p>
      </CardContent>
    </Card>
  );
}

import type { FunnelNode, MissionFunnelData } from "@/types/dto";
import { ResponsiveSankey } from "@nivo/sankey";

interface MissionSankeyChartProps {
  data: MissionFunnelData;
}

const NODE_COLORS = {
  start: "#10b981", // emerald-500: 시작 (긍정적인 초록)
  entry: "#3b82f6", // blue-500: 진입 (중립적인 파랑)
  response: "#8b5cf6", // violet-500: 완료 (성공적인 보라)
  drop: "#ef4444", // red-500: 이탈 (경고의 빨강)
} as const;

export function MissionSankeyChart({ data }: MissionSankeyChartProps) {
  const usedNodeIds = new Set([...data.links.map(l => l.source), ...data.links.map(l => l.target)]);

  return (
    <div className="h-[600px] w-full">
      <ResponsiveSankey
        data={{
          nodes: data.nodes
            .filter(node => usedNodeIds.has(node.id))
            .map((node: FunnelNode) => ({
              id: node.id,
              nodeColor: NODE_COLORS[node.type],
            })),
          links: data.links,
        }}
        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
        align="justify"
        colors={(node: { nodeColor: string }) => node.nodeColor}
        nodeOpacity={1}
        nodeHoverOpacity={1}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOpacity={0.8}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1]],
        }}
        animate={true}
        motionConfig="gentle"
      />
    </div>
  );
}

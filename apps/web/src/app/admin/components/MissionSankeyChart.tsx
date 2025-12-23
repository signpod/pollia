import type { FunnelNode, MissionFunnelData } from "@/types/dto";
import { ResponsiveSankey } from "@nivo/sankey";

interface MissionSankeyChartProps {
  data: MissionFunnelData;
}

const NODE_COLORS = {
  start: "#10b981",
  entry: "#3b82f6",
  response: "#8b5cf6",
  drop: "#ef4444",
} as const;

export function MissionSankeyChart({ data }: MissionSankeyChartProps) {
  if (!data?.nodes || !data?.links || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">유효하지 않은 데이터입니다</p>
      </div>
    );
  }

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">아직 참여한 사용자가 없습니다</p>
      </div>
    );
  }

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
        sort="input"
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

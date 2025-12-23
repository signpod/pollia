import type { FunnelNode, MissionFunnelData } from "@/types/dto";
import { ResponsiveSankey } from "@nivo/sankey";

interface MissionSankeyChartProps {
  data: MissionFunnelData;
}

const NODE_COLORS = {
  start: "hsl(173 58% 48%)",
  entry: "hsl(43 96% 56%)",
  response: "hsl(280 65% 60%)",
  drop: "hsl(14 90% 63%)",
} as const;

export function MissionSankeyChart({ data }: MissionSankeyChartProps) {
  if (!data?.nodes || !data?.links || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">유효하지 않은 데이터입니다</p>
      </div>
    );
  }

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">아직 참여한 사용자가 없습니다</p>
      </div>
    );
  }

  const usedNodeIds = new Set([...data.links.map(l => l.source), ...data.links.map(l => l.target)]);

  return (
    <div className="h-[450px] w-full">
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
        margin={{ top: 30, right: 160, bottom: 30, left: 60 }}
        layout="horizontal"
        align="justify"
        sort="auto"
        colors={(node: { nodeColor: string }) => node.nodeColor}
        nodeOpacity={1}
        nodeHoverOpacity={1}
        nodeThickness={22}
        nodeSpacing={35}
        nodeBorderWidth={0}
        nodeBorderRadius={4}
        linkOpacity={0.2}
        linkHoverOpacity={0.5}
        linkHoverOthersOpacity={0.08}
        linkContract={0}
        linkBlendMode="normal"
        enableLinkGradient={true}
        label={node => node.id}
        labelOrientation="vertical"
        labelPadding={8}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 2.5]],
        }}
        nodeTooltip={({ node }) => (
          <div
            style={{
              background: "white",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              maxWidth: "300px",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "13px" }}>{node.id}</div>
          </div>
        )}
        linkTooltip={({ link }) => (
          <div
            style={{
              background: "white",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              maxWidth: "300px",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            <div style={{ fontSize: "12px", marginBottom: "4px" }}>
              <strong>{link.source.id}</strong>
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0" }}>↓</div>
            <div style={{ fontSize: "12px", marginBottom: "6px" }}>
              <strong>{link.target.id}</strong>
            </div>
          </div>
        )}
        theme={{
          labels: {
            text: {
              fontSize: 14,
              fontWeight: 700,
              fill: "#ffffff",
            },
          },
        }}
        animate={true}
        motionConfig="gentle"
      />
    </div>
  );
}

import type { FunnelNode, MissionFunnelData } from "@/types/dto";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - @nivo/sankey type definitions may be incomplete
import { ResponsiveSankey } from "@nivo/sankey";
import type { CSSProperties, ReactNode } from "react";

interface MissionSankeyChartProps {
  data: MissionFunnelData;
}

const NODE_COLORS = {
  start: "hsl(173 58% 48%)",
  entry: "hsl(43 96% 56%)",
  response: "hsl(280 65% 60%)",
  drop: "hsl(14 90% 63%)",
} as const;

const TOOLTIP_WIDTH = 220;
const TOOLTIP_OFFSET = TOOLTIP_WIDTH / 2 + 10;
const TOOLTIP_Y_OFFSET = -60;

const TOOLTIP_BASE_STYLE: CSSProperties = {
  background: "white",
  padding: "8px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  width: `${TOOLTIP_WIDTH}px`,
  wordBreak: "keep-all",
  overflowWrap: "break-word",
  whiteSpace: "normal",
  transform: `translate(${TOOLTIP_OFFSET}px, ${TOOLTIP_Y_OFFSET}px)`,
  pointerEvents: "none",
};

interface TooltipContainerProps {
  children: ReactNode;
}

function TooltipContainer({ children }: TooltipContainerProps) {
  return <div style={TOOLTIP_BASE_STYLE}>{children}</div>;
}

interface NodeTooltipContentProps {
  title: string;
  count: number;
  percent: string;
}

function NodeTooltipContent({ title, count, percent }: NodeTooltipContentProps) {
  return (
    <>
      <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "13px" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#64748b" }}>
        {count}명 ({percent})
      </div>
    </>
  );
}

interface LinkTooltipContentProps {
  source: string;
  target: string;
  value: number;
  percent: string;
}

function LinkTooltipContent({ source, target, value, percent }: LinkTooltipContentProps) {
  return (
    <>
      <div style={{ fontSize: "12px", marginBottom: "4px" }}>
        <strong>{source}</strong>
      </div>
      <div style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0" }}>↓</div>
      <div style={{ fontSize: "12px", marginBottom: "6px" }}>
        <strong>{target}</strong>
      </div>
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
        {value}명 이동 ({percent})
      </div>
    </>
  );
}

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

  const validLinks = data.links.filter(link => link.value > 0);

  if (validLinks.length === 0) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">표시할 데이터가 없습니다</p>
      </div>
    );
  }

  const usedNodeIds = new Set([...validLinks.map(l => l.source), ...validLinks.map(l => l.target)]);

  const nodeValueMap = new Map<string, number>();
  data.nodes.forEach(node => {
    nodeValueMap.set(node.id, node.count);
  });

  const totalStarted = data.metadata.totalStarted;

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

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
          links: validLinks,
        }}
        margin={{ top: 30, right: 160, bottom: 30, left: 60 }}
        layout="horizontal"
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
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        label={(node: any) => node.id}
        labelOrientation="vertical"
        labelPadding={8}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 2.5]],
        }}
        nodeTooltip={({ node }: { node: any }) => {
          const nodeCount = nodeValueMap.get(node.id) || node.value || 0;
          const percent = formatPercent(nodeCount, totalStarted);

          return (
            <TooltipContainer>
              <NodeTooltipContent title={node.id} count={nodeCount} percent={percent} />
            </TooltipContainer>
          );
        }}
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        linkTooltip={({ link }: { link: any }) => {
          const sourceCount = nodeValueMap.get(link.source.id) || 0;
          const percent = formatPercent(link.value, sourceCount);

          return (
            <TooltipContainer>
              <LinkTooltipContent
                source={link.source.id}
                target={link.target.id}
                value={link.value}
                percent={percent}
              />
            </TooltipContainer>
          );
        }}
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

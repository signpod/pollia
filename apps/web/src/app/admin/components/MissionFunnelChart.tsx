import type { FunnelNode, MissionFunnelData } from "@/types/dto";
import { ResponsiveSankey } from "@nivo/sankey";

interface MissionFunnelChartProps {
  data: MissionFunnelData;
}

export function MissionFunnelChart({ data }: MissionFunnelChartProps) {
  return (
    <div className="h-[600px] w-full">
      <ResponsiveSankey
        data={{
          nodes: data.nodes.map((node: FunnelNode) => ({
            id: node.id,
            nodeColor: node.type === "drop" ? "hsl(0, 70%, 50%)" : undefined,
          })),
          links: data.links,
        }}
        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
        align="justify"
        colors={{ scheme: "category10" }}
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

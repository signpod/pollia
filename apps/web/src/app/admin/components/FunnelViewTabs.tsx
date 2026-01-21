"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import type { MissionFunnelData } from "@/types/dto";
import type { MissionStats } from "@/types/mission-stats";
import { BarChart3, List } from "lucide-react";
import dynamic from "next/dynamic";
import { MissionFunnelTextView } from "./MissionFunnelTextView";

const MissionSankeyChart = dynamic(
  () => import("./MissionSankeyChart").then(mod => mod.MissionSankeyChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center">
        <div className="text-muted-foreground">차트 로딩 중...</div>
      </div>
    ),
  },
);

interface FunnelViewTabsProps {
  data: MissionFunnelData;
  missionStats: MissionStats;
  defaultTab?: "text" | "diagram";
}

export function FunnelViewTabs({ data, missionStats, defaultTab = "text" }: FunnelViewTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="text" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          텍스트
        </TabsTrigger>
        <TabsTrigger value="diagram" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          다이어그램
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="mt-6">
        <MissionFunnelTextView metadata={data.metadata} missionStats={missionStats} />
      </TabsContent>

      <TabsContent value="diagram" className="mt-6">
        <MissionSankeyChart data={data} />
      </TabsContent>
    </Tabs>
  );
}

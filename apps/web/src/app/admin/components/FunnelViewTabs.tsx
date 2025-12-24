"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import type { MissionFunnelData } from "@/types/dto";
import { BarChart3, List } from "lucide-react";
import { MissionFunnelTextView } from "./MissionFunnelTextView";
import { MissionSankeyChart } from "./MissionSankeyChart";

interface FunnelViewTabsProps {
  data: MissionFunnelData;
}

export function FunnelViewTabs({ data }: FunnelViewTabsProps) {
  return (
    <Tabs defaultValue="text" className="w-full">
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
        <MissionFunnelTextView metadata={data.metadata} />
      </TabsContent>

      <TabsContent value="diagram" className="mt-6">
        <MissionSankeyChart data={data} />
      </TabsContent>
    </Tabs>
  );
}

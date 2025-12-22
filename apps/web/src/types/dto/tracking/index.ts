import type { FunnelLink, FunnelNode, MissionFunnelData } from "@/server/services/tracking/types";

export type { MissionFunnelData, FunnelNode, FunnelLink };

export interface GetMissionFunnelResponse {
  data: MissionFunnelData;
}

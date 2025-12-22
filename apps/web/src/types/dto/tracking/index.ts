import type {
  FunnelLink as ServerFunnelLink,
  FunnelNode as ServerFunnelNode,
  MissionFunnelData as ServerMissionFunnelData,
} from "@/server/services/tracking/types";

export type FunnelNode = ServerFunnelNode;
export type FunnelLink = ServerFunnelLink;
export type MissionFunnelData = ServerMissionFunnelData;

export interface GetMissionFunnelResponse {
  data: MissionFunnelData;
}

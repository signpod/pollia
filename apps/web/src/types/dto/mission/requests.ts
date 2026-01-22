import type { MissionInput, MissionUpdate } from "@/schemas/mission";

export type CreateMissionRequest = MissionInput;

export type UpdateMissionRequest = MissionUpdate;

export interface DuplicateMissionRequest {
  missionId: string;
}

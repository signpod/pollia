import type { UseFormReturn } from "react-hook-form";
import type { CreateMissionFormData } from "../schema";

export type CreateMissionStep = "category" | "mode" | "project-info" | "success";

export interface CreateMissionSuccessResult {
  missionId: string;
  warnings: string[];
}

export interface UseCreateMissionFunnelParams {
  form: UseFormReturn<CreateMissionFormData>;
  initialStep?: CreateMissionStep;
}

export const CREATE_MISSION_PROGRESS_STEPS: Exclude<CreateMissionStep, "success">[] = [
  "category",
  "mode",
  "project-info",
];

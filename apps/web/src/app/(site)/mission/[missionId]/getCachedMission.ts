import { getMission } from "@/actions/mission";
import { cache } from "react";

export const getCachedMission = cache(getMission);

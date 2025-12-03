import { createMission } from "./create";
import { deleteMission } from "./delete";
import { getMission, getUserMissions } from "./read";
import { updateMission } from "./update";

export const createSurvey = createMission;
export const getUserSurveys = getUserMissions;
export const getSurvey = getMission;
export const updateSurvey = updateMission;
export const deleteSurvey = deleteMission;

export { createMission, getUserMissions, getMission, updateMission, deleteMission };

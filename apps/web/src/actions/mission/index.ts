export { createMission, createSurvey } from "./create";
import { deleteMission } from "./delete";
import { getMission, getUserMissions } from "./read";
import { updateMission } from "./update";

export const getUserSurveys = getUserMissions;
export const getSurvey = getMission;
export const updateSurvey = updateMission;
export const deleteSurvey = deleteMission;

export { getUserMissions, getMission, updateMission, deleteMission };

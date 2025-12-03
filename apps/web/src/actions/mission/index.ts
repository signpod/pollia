import { createMission } from "./create";
import { getUserMissions, getMission } from "./read";
import { updateMission } from "./update";
import { deleteMission } from "./delete";

export const createSurvey = createMission;
export const getUserSurveys = getUserMissions;
export const getSurvey = getMission;
export const updateSurvey = updateMission;
export const deleteSurvey = deleteMission;

export {
  createMission,
  getUserMissions,
  getMission,
  updateMission,
  deleteMission
};
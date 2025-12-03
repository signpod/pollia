import { completeMissionResponse, startMissionResponse } from "./create";
import { deleteMissionResponse } from "./delete";
import {
  getMyResponseForMission,
  getMyResponses,
  getMissionResponse,
  getMissionResponses,
  getMissionStats,
} from "./read";

export const completeSurveyResponse = completeMissionResponse;
export const startSurveyResponse = startMissionResponse;
export const deleteSurveyResponse = deleteMissionResponse;
export const getMyResponseForSurvey = getMyResponseForMission;
export const getSurveyResponse = getMissionResponse;
export const getSurveyResponses = getMissionResponses;
export const getSurveyStats = getMissionStats;


export {
  completeMissionResponse,
  startMissionResponse,
  deleteMissionResponse,
  getMyResponseForMission,
  getMyResponses,
  getMissionResponse,
  getMissionResponses,
  getMissionStats,
};
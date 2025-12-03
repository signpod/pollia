import {
  createMultipleChoiceAction,
  createScaleAction,
  createSubjectiveAction,
  createEitherOrAction,
} from "./create";
import {
  getActionById,
  getMissionActionIds,
  getMissionActionsDetail,
  getMissionActions,
} from "./read";
import { updateAction } from "./update";
import { deleteAction } from "./delete";

export const getSurveyQuestionIds = getMissionActionIds;
export const getSurveyQuestionsDetail = getMissionActionsDetail;
export const getSurveyQuestions = getMissionActions;

export {
  createMultipleChoiceAction,
  createScaleAction,
  createSubjectiveAction,
  createEitherOrAction,
  getActionById,
  getMissionActionIds,
  getMissionActionsDetail,
  getMissionActions,
  updateAction,
  deleteAction,
};
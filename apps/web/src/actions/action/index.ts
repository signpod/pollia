import { createMultipleChoiceAction, createScaleAction, createSubjectiveAction } from "./create";
import { deleteAction } from "./delete";
import {
  getActionById,
  getMissionActionIds,
  getMissionActions,
  getMissionActionsDetail,
} from "./read";
import { updateAction } from "./update";

export const getSurveyQuestionIds = getMissionActionIds;
export const getSurveyQuestionsDetail = getMissionActionsDetail;
export const getSurveyQuestions = getMissionActions;
export const getQuestionById = getActionById;
export const createMultipleChoiceQuestion = createMultipleChoiceAction;
export const createScaleQuestion = createScaleAction;
export const createSubjectiveQuestion = createSubjectiveAction;

export {
  createMultipleChoiceAction,
  createScaleAction,
  createSubjectiveAction,
  getActionById,
  getMissionActionIds,
  getMissionActionsDetail,
  getMissionActions,
  updateAction,
  deleteAction,
};

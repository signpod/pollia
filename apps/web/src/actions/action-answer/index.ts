import { submitAnswers } from "./create";
export { createAnswer, submitAnswers } from "./create";
export { deleteAnswersByResponse, deleteAnswer } from "./delete";
export { getAnswersByResponse, getMyAnswers, getAnswer } from "./read";
export { updateAnswer } from "./update";

export const submitQuestionAnswers = submitAnswers;

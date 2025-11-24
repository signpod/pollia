export interface CreateAnswerRequest {
  questionId: string;
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface SubmitAnswersRequest {
  surveyId: string;
  answers: Array<{
    questionId: string;
    type: "MULTIPLE_CHOICE" | "SCALE" | "SUBJECTIVE";
    selectedOptionIds?: string[];
    scaleValue?: number;
    textResponse?: string;
  }>;
}

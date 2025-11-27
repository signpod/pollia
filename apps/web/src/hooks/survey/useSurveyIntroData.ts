import { useReadSurvey, useReadSurveyQuestionIds } from "@/hooks/survey";
import { useReadSurveyResponseForSurvey } from "@/hooks/survey-response";

/**
 * 설문 인트로 페이지에 필요한 모든 데이터를 조회하는 훅
 */
export function useSurveyIntroData(surveyId: string) {
  const { data: survey } = useReadSurvey(surveyId);
  const { data: questionIds } = useReadSurveyQuestionIds(surveyId);
  const { data: surveyResponse } = useReadSurveyResponseForSurvey({ surveyId });

  const firstQuestionId = questionIds?.data.questionIds[0];
  const isCompleted = !!surveyResponse?.data?.completedAt;
  const lastQuestionIndex = surveyResponse?.data?.answers?.length ?? 0;
  const nextQuestionId = questionIds?.data.questionIds[lastQuestionIndex];
  const isEnabledToResume = !isCompleted && lastQuestionIndex > 0 && !!nextQuestionId;

  return {
    survey: survey?.data,
    questionIds: questionIds?.data.questionIds,
    surveyResponse: surveyResponse?.data,
    firstQuestionId,
    nextQuestionId,
    isCompleted,
    isEnabledToResume,
    lastQuestionIndex,
  };
}

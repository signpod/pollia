'use server';

import { getQueryClient } from '@/lib/getQueryClient';
import { dehydrate } from '@tanstack/react-query';
import { PageClientWrapper } from './ui/PageClientWrapper';
import { CreateSurveyContent } from './ui/CreateSurveyContent';
import { surveyQueryKeys } from '@/constants/queryKeys/surveyQueryKeys';
import { getSurveyQuestions } from '@/actions/survey/question/read';

export default async function CreateSurveyPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.surveyQuestions(),
    queryFn: () => getSurveyQuestions(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageClientWrapper dehydratedState={dehydratedState}>
      <CreateSurveyContent />
    </PageClientWrapper>
  );
}

'use server';

import { getQueryClient } from '@/lib/getQueryClient';
import { dehydrate } from '@tanstack/react-query';
import { PageClientWrapper } from './ui/PageClientWrapper';
import { pollQueryKeys } from '@/constants/queryKeys/pollQueryKeys';
import { getUserPolls } from '@/actions/poll/read';
import { CreateSurveyContent } from './ui/CreateSurveyContent';

export default async function CreateSurveyPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.userPolls(),
    queryFn: () => getUserPolls(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageClientWrapper dehydratedState={dehydratedState}>
      <CreateSurveyContent />
    </PageClientWrapper>
  );
}

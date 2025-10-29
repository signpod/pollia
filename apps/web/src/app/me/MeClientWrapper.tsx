'use client';

import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from '@tanstack/react-query';
import { FixedBottomLayout, FixedTopLayout } from '@repo/ui/components';
import { getQueryClient } from '@/lib/getQueryClient';
import { ProfileContainer } from './ProfileContainer';
import PollCreateFloatingButton from '@/components/poll/PollCreateFloatingButton';
import Link from 'next/link';
import SurveyCreateFloatingButton from '@/components/survey/SurveyCreateFloatingButton';

interface MeClientWrapperProps {
  dehydratedState: DehydratedState;
}

export function MeClientWrapper({ dehydratedState }: MeClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <FixedBottomLayout className="bg-zinc-50 min-h-screen">
          <FixedTopLayout className="space-y-6">
            <FixedTopLayout.Content className="bg-transparent">
              <div className="h-12" />
            </FixedTopLayout.Content>
            <ProfileContainer />
          </FixedTopLayout>
          <FixedBottomLayout.Content className="w-full flex justify-end p-4 bg-transparent">
            <div className="flex flex-col gap-4 fixed bottom-5 right-5">
              <Link href="/poll/create">
                <PollCreateFloatingButton variant="with-text" />
              </Link>
              <Link href="/survey/create">
                <SurveyCreateFloatingButton variant="with-text" />
              </Link>
            </div>
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

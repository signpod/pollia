'use client';

import {
  DehydratedState,
  HydrationBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { PropsWithChildren } from 'react';

interface PageClientWrapperProps extends PropsWithChildren {
  dehydratedState: DehydratedState;
}

export function PageClientWrapper({
  dehydratedState,
  children,
}: PageClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}

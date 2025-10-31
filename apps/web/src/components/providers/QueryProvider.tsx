"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSetAtom } from "jotai";
import { runAfterTransitionAtom } from "@/atoms/routeTransitionAtoms";
import { getQueryClient } from "@/lib/getQueryClient";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // getQueryClient() 사용. https://tanstack.com/query/v5/docs/framework/react/guides/ssr
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const runAfterTransition = useSetAtom(runAfterTransitionAtom);

  useEffect(() => {
    runAfterTransition();
  }, [pathname, runAfterTransition]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

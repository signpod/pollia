"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/getQueryClient";
import { usePathname } from "next/navigation";
import { useSetAtom } from "jotai";
import { runAfterTransitionAtom } from "@/atoms/routeTransitionAtoms";
import { useEffect } from "react";

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

"use client";

import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";

export function AdminQueryProvider({ children }: PropsWithChildren) {
  const queryClient = getAdminQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

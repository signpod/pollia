"use client";

import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

interface AdminHydrationBoundaryProps extends PropsWithChildren {
  state: DehydratedState;
}

export function AdminHydrationBoundary({ state, children }: AdminHydrationBoundaryProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}


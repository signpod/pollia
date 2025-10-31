"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { setAfterTransitionAtom } from "@/atoms/routeTransitionAtoms";

export function usePushAfter() {
  const router = useRouter();
  const setAfter = useSetAtom(setAfterTransitionAtom);

  return useCallback(
    (href: string, onAfter?: () => void) => {
      setAfter(onAfter);
      router.push(href);
    },
    [router, setAfter],
  );
}

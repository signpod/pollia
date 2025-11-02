"use client";

import { setAfterTransitionAtom } from "@/atoms/routeTransitionAtoms";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

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

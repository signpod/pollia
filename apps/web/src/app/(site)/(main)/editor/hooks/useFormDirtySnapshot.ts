"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

function serializeForComparison(values: unknown): string {
  return JSON.stringify(values, (_key, value) => {
    if (value instanceof Date) return value.toISOString();
    if (value === undefined) return null;
    return value;
  });
}

export interface UseFormDirtySnapshotReturn {
  hasPendingChanges: boolean;
  markClean: () => void;
}

export function useFormDirtySnapshot<T extends FieldValues>(
  form: UseFormReturn<T>,
): UseFormDirtySnapshotReturn {
  const snapshotRef = useRef<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only snapshot capture
  useEffect(() => {
    snapshotRef.current = serializeForComparison(form.getValues());
    setHasPendingChanges(false);
  }, []);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (snapshotRef.current === null) return;
      const current = serializeForComparison(form.getValues());
      setHasPendingChanges(current !== snapshotRef.current);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const markClean = useCallback(() => {
    snapshotRef.current = serializeForComparison(form.getValues());
    setHasPendingChanges(false);
  }, [form]);

  return { hasPendingChanges, markClean };
}

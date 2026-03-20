"use client";

import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { ZodType } from "zod";

export interface UseFormEagerValidationReturn {
  validationIssueCount: number;
  hasValidationIssues: boolean;
}

export function useFormEagerValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: ZodType,
): UseFormEagerValidationReturn {
  const [validationIssueCount, setValidationIssueCount] = useState(() => {
    const result = schema.safeParse(form.getValues());
    return result.success ? 0 : result.error.issues.length;
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      const result = schema.safeParse(form.getValues());
      setValidationIssueCount(result.success ? 0 : result.error.issues.length);
    });
    return () => subscription.unsubscribe();
  }, [form, schema]);

  return {
    validationIssueCount,
    hasValidationIssues: validationIssueCount > 0,
  };
}

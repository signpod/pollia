"use client";

import { useCallback } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export function useFormScrollToFirstError<T extends FieldValues>(form: UseFormReturn<T>) {
  return useCallback(async () => {
    await form.trigger();
    requestAnimationFrame(() => {
      const el = document.querySelector("[data-field-error]");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [form]);
}

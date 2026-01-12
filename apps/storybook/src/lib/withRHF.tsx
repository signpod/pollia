"use client";

import type { ReactNode } from "react";
import {
  type Control,
  type DefaultValues,
  type FieldValues,
  FormProvider,
  useForm,
} from "react-hook-form";

interface RHFFormProps<T extends FieldValues> {
  defaultValues: DefaultValues<T>;
  render: (props: { control: Control<T>; form: ReturnType<typeof useForm<T>> }) => ReactNode;
}

export function RHFForm<T extends FieldValues>({ defaultValues, render }: RHFFormProps<T>) {
  const form = useForm<T>({ defaultValues });

  return <FormProvider {...form}>{render({ control: form.control, form })}</FormProvider>;
}

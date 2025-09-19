"use client";

import { useMutation } from "@tanstack/react-query";

export type CreatePollOptionInput = {
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
};

export type CreatePollInput = {
  categories: string;
  title: string;
  description?: string;
  imageUrl?: string;
  options: CreatePollOptionInput[];
};

export function useCreatePoll() {
  return useMutation({
    mutationFn: async (payload: CreatePollInput) => {},
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";
import { http } from "@/src/lib/http/default";

export type CreatePollOptionInput = {
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
};

export type CreatePollInput = {
  category: string | null;
  title: string;
  description?: string;
  imageUrl?: string;
  options: CreatePollOptionInput[];
};

export function useCreatePoll() {
  return useMutation({
    mutationFn: async (payload: CreatePollInput) => {
      // 서버 스키마에 맞게 경로/페이로드 조정
      const res = await http.post("/polls", payload);
      return res as unknown;
    },
  });
}



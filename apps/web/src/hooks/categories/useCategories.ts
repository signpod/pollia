"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/default";
import { Category } from "@/types/poll";


export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const res = await http.get<{categories: Category[]}>("/categories");
      return res.categories;
    },
    staleTime: 1000 * 60 * 5,
  });
}



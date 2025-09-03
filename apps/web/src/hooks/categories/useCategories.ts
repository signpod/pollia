"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/default";

function extractNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const it of value) {
    if (typeof it === "string") {
      out.push(it);
    } else if (
      typeof it === "object" && it !== null && "name" in it && typeof (it as { name: unknown }).name === "string"
    ) {
      out.push((it as { name: string }).name);
    }
  }
  return out;
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async (): Promise<string[]> => {
      const res = await http.get<unknown>("/categories");
      if (Array.isArray(res)) {
        return extractNames(res);
      }
      const maybeObj = res as { categories?: unknown; data?: unknown };
      if (Array.isArray(maybeObj.categories)) return extractNames(maybeObj.categories);
      if (Array.isArray(maybeObj.data)) return extractNames(maybeObj.data);
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}



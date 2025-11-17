"use client";

import Providers from "@/components/providers/QueryProvider";
import type { PropsWithChildren } from "react";

export default function SurveyLayout({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}

"use client";

import { useEffect, useState } from "react";

export function useAdminRootContainer() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.querySelector(".admin-root") as HTMLElement);
  }, []);

  return container;
}

"use client";

import { useEffect, useState } from "react";

const ADMIN_THEME_KEY = "pollia-admin-theme-mode";

export function useAdminTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(ADMIN_THEME_KEY);
    if (stored) {
      setIsDark(stored === "dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.querySelector(".admin-root");
    if (root) {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem(ADMIN_THEME_KEY, isDark ? "dark" : "light");
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return {
    isDark,
    toggleTheme,
    mounted,
  };
}
